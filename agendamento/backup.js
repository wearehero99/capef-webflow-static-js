
   async function setupToken() {
      let token = localStorage.getItem('authToken');

      if (!token) {
         const authResponse = await fetch("https://apifalecimento.capef.com.br/auth/access-token", {
            method: "POST",
            body: JSON.stringify({
               username: "Hero99",
               password: "d7OwsEqTXc"
            }),
            headers: {
               "Content-Type": "application/json"
            }
         });

         if (!authResponse.ok) {
            throw new Error("Failed to obtain authentication token");
         }

         const authData = await authResponse.json();
         token = authData.access_Token;

         localStorage.setItem('authToken', token);
      }
   }

async function loadScript() {

   await setupToken()

   async function authFetch(url, options = {}) {
      try {
         let token = localStorage.getItem('authToken');

         const headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`
         };

         const dataResponse = await fetch(url, {
            ...options,
            headers
         });

         if (dataResponse.status === 401) {
            localStorage.removeItem("authToken")
            await setupToken()
            getTimesOfToday()
         }


         if (dataResponse.status === 204) {
            return {
               status: dataResponse.status
            }
         }


         if (!dataResponse.ok) {
            if (await dataResponse.json()) {
               const result = await dataResponse.json()

               return {
                  error: result[0],
                  status: dataResponse.status
               }
            } else {

               return {
                  status: dataResponse.status
               }
            }
         }

         const data = await dataResponse.json();
         return data;
      } catch (error) {
         return error
      }
   }

   const api = authFetch


   var urlSchedule = "https://apiagendamento.capef.com.br"
   var urlCalend = "https://apiagendamento.capef.com.br"

   function showFormFailMessage(message) {
      $(".w-form-fail").css("display", "block");
      $(".w-form-fail").text(message);
   }

   function clearError() {
      $(".w-form-fail").css("display", "none");
      $(".w-form-fail").text("");
   }

   $(document).ready(function () {
      $("#phone-01").mask("(99) 9 9999-9999");
      $("#phone-02").mask("(99) 9 9999-9999");
      $("#cpf-01").mask("999.999.999-99");
      $("#cpf-02").mask("999.999.999-99");
   });


   function getElement(selector) {
      return document.querySelector(selector);
   }

   async function getTimes({
      day,
      year,
      month,
      atendimentoType
   }) {

      const attId = atendimentoType

      try {
         const response = await
         api(`${urlCalend}/horarios/atendimento/${attId}/dia/${day}/mes/${month}/ano/${year}`)
         const data = response

         if (data.status === 204) {
            //Sem horarios
            showFormFailMessage("Sem horarios disponível para está data")

            return;
         } else {
            if (data.error) {
               //Chamar o erro aqui e mostra a mensagem de erro.
               console.log("error ===> ", data.error)
               return;
            }
            clearError()

            if(data.length){
            	const horariosWithoutKeys = data.map(item => item.horarios);

          		const timeInput = $("#time-input-2");


              $.each(horariosWithoutKeys, function (index, value) {
                timeInput.append("<option value='" + value + "'>" + value + "</option>");
              });

          	timeInput.val(horariosWithoutKeys[0]);
        	}
         }

      } catch (error) {
         console.log(error)
      }

   }


   async function checkCPF(cpf) {
      const response = await api(`${urlSchedule}/agendamento/validar/cpf/${cpf}`)
      const data = (await response).json()
      console.log("checkCPF Data ====> ", data)
   }

   async function getTimesOfToday() {
      const currentDate = new Date();

      // Get the current day, month, and year
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth() + 1; // January is 0
      const currentYear = currentDate.getFullYear();
      const planInputValue = getElement("#plan-input").value;


      // Set the default values for the input fields
      $("#dia-input").val(currentDay);
      $("#mes-input").val(currentMonth);
      $("#year-input").val(currentYear);

      getTimes({
         day: currentDay,
         year: currentYear,
         month: currentMonth,
         atendimentoType: planInputValue
      })
   }

   getTimesOfToday()

   async function isAttendAlreadyExist({
      typeAtt,
      cpf
   }) {
      const response = await api(`${urlSchedule}/agendamento/existe/atendimento/${typeAtt}/cpf/${cpf}`)
      const result = response

      if (result.status === 204) {
         clearError()
         //show the error msg
         showFormFailMessage("Não existe agendamento gravados que atendem aos parâmetros passados.")
         return false;
      } else {
         const data = (await response).json()
         return true
      }

   }

   async function scheduleAttend(data) {

      clearError()
      $("#atendimento-presencial-submit").prop("disabled", true);
      $("#atendimento-presencial-submit").text("carregando...");

      const response = await api(`${urlSchedule}/agendamento/criar`, {
         method: "POST",
         body: JSON.stringify(data)
      })

      $("#atendimento-presencial-submit").prop("disabled", false);

      if (response.status === 200) {
         $("#email-form02").css("display", "none")
         $(".w-form-done").css("display", "block");
      }
   }


   function getElement(selector) {
      return document.querySelector(selector);
   }


   $("#dia-input, #mes-input, #year-input, #plan-input").change(function () {
      clearError()
      // Get the new input values
      const day = $("#dia-input").val();
      const month = $("#mes-input").val();
      const year = $("#year-input").val();
      const planInputValue = getElement("#plan-input").value;


      getTimes({
         day,
         year,
         month,
         atendimentoType: planInputValue
      })
   })

   let tipoAtendimento = 0

   const electronicService = getElement("#atendimento-eletronico-input");
   const personalAssistance = getElement("#atendimento-presencial-input");

   $("#atendimento-eletronico-input").click(function () {
      console.log("tipoAtendimento", 1)
      tipoAtendimento = 1
   });

   $("#atendimento-presencial-input").click(function () {
      console.log("tipoAtendimento", 0)
      tipoAtendimento = 0
   });


   async function getPlans() {
      const response = await api(`${urlSchedule}/plano`)
      const result = response


      const planInput = $("#plan-input");

      $.each(result, function (index, value) {
         planInput.append("<option value='" + value.id + "'>" + value.descricao + "</option>");
      });

      planInput.val(result[0].id);
   }

   getPlans()

   $("#dia-input, #mes-input, #year-input, #plan-input, #phone-01, #time-input-2, #email-input, #assunto-input").change(function () {
      clearError()
   })

   async function createRegistration() {
      clearError()
      const phoneValue = getElement("#phone-01").value;
      const cpfInputValue = getElement("#cpf-01").value;
      const timeInputValue = getElement("#time-input-2").value;
      const planInputValue = getElement("#plan-input").value;
      const emailInputValue = getElement("#email-input").value;
      const assuntoInputValue = getElement("#assunto-input") ? getElement("#assunto-input").value : "";
      const day = getElement("#dia-input").value
      const month = getElement("#mes-input").value
      const year = getElement("#year-input").value
      const phoneDDD = phoneValue.replace("(", "").replace(")", "").substring(0, 3);
      const phoneRest = phoneValue.replace("(", "").replace(")", "").substring(3);


      // Verify the values
      if (cpfInputValue && timeInputValue && planInputValue && emailInputValue && phoneValue) {
         // Split the phone value

         const resultCPF = await isAttendAlreadyExist({
            cpf: cpfInputValue,
            typeAtt: tipoAtendimento
         })


         if (resultCPF) {

            const raw = {
               ano: year,
               dia: day,
               mes: month,
               plano: planInputValue,
               assunto: tipoAtendimento === 1 ? assuntoInputValue : "Outros",
               horario: timeInputValue,
               cpf: cpfInputValue,
               ddd: phoneDDD.replace(" ", ""),
               telefone: phoneRest.replace(" ", "").replace("-", ""),
               email: emailInputValue,
               tipoAtendimento: tipoAtendimento,
            };

            const response = await scheduleAttend(raw)
            console.log("response schedule ===> ", response)

         }

         return;

      } else {
         showFormFailMessage("Todos os campos são obrigatorios")
         console.log("One or more input values are missing.");
         return;
      }


   }

   getElement("#atendimento-presencial-submit").addEventListener(
      "click",
      createRegistration
   );


}


loadScript()

