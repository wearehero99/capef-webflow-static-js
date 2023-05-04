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
    let tipoAtendimento = 0
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
      const planInputValue = getElement(tipoAtendimento  === 0 ? "#plan-input":"#plan-input-2").value;


      // Set the default values for the input fields
      $("#dia-input, #dia-input-2 ").val(currentDay);
      $("#mes-input, #mes-input-2").val(currentMonth);
      $("#year-input, #year-input-2").val(currentYear);

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
      $("#atendimento-presencial-submit, #atendimento-eletronico-submit").prop("disabled", true);
      $("#atendimento-presencial-submit, #atendimento-eletronico-submit").text("carregando...");

      const response = await api(`${urlSchedule}/agendamento/criar`, {
         method: "POST",
         body: JSON.stringify(data)
      })

      $("#atendimento-presencial-submit, #atendimento-eletronico-submit").prop("disabled", false);

      if (response.status === 200) {
         $("#email-form02").css("display", "none")
         $(".w-form-done").css("display", "block");
      }
   }


   function getElement(selector) {
      return document.querySelector(selector);
   }


   $("#dia-input, #mes-input, #year-input, #plan-input, #dia-input-2, #mes-input-2, #year-input-2, #plan-input-2").change(function () {
      clearError()
      // Get the new input values

      const day = $(tipoAtendimento  === 0 ? "#dia-input" : "#dia-input-2").val();
      const month = $(tipoAtendimento  === 0 ? "#mes-input": "#mes-input-2").val();
      const year = $(tipoAtendimento  === 0 ? "#year-input": "#year-input-2").val();
      const planInputValue = getElement(tipoAtendimento  === 0 ? "#plan-input":"#plan-input-2").value;


      getTimes({
         day,
         year,
         month,
         atendimentoType: planInputValue
      })

   })

   


   $("#atendimento-eletronico-input, #atendimento-eletronico-submit").click(function () {
        clearError()
      tipoAtendimento = 1
   });

   $("#atendimento-presencial-input, #atendimento-eletronico-submit").click(function () {
      clearError()
      tipoAtendimento = 0
   });


   async function getPlans() {
      const response = await api(`${urlSchedule}/plano`)
      const result = response


      const planInput = $("#plan-input");
      const planInput2 = $("#plan-input-2");


      $.each(result, function (index, value) {
         planInput.append("<option value='" + value.id + "'>" + value.descricao + "</option>");
         planInput2.append("<option value='" + value.id + "'>" + value.descricao + "</option>");
      });

      planInput.val(result[0].id);
      planInput2.val(result[0].id);
   }

   getPlans()

   $("#dia-input, #mes-input, #year-input, #plan-input,#mes-input-2, #year-input-2, #plan-input-2, #phone-01,#phone-02, #time-input-2, #email-input,#email-input-2, #assunto-input").change(function () {
      clearError()
   })

   async function createRegistration() {
      clearError()
      const phoneValue = getElement(tipoAtendimento ===0 ?  "#phone-01" :"#phone-02").value;
      const cpfInputValue = getElement(tipoAtendimento === 0 ? "#cpf-01": "#cpf-02").value;
      const timeInputValue = getElement(tipoAtendimento === 0 ? "#time-input-2": "#horario-2").value;
      const planInputValue = getElement(tipoAtendimento === 0 ? "#plan-input": "#plan-input-2").value;
      const emailInputValue = getElement(tipoAtendimento === 0 ? "#email-input": "#email-input-2").value;
      const assuntoInputValue = getElement("#assunto-input") ? getElement("#assunto-input").value : "";
      const day = getElement(tipoAtendimento === 0 ? "#dia-input": "#dia-input-2").value
      const month = getElement(tipoAtendimento === 0 ? "#mes-input": "#mes-input-2").value
      const year = getElement(tipoAtendimento === 0 ? "#year-input": "#year-input-2").value
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


document.querySelector("#atendimento-eletronico-submit").addEventListener(
      "click",
      ()=> { console.log("#atendimento-eletronico-submit") }
)