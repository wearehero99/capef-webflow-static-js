function IMask(element, maskOptions) {
  const input = element instanceof HTMLInputElement ? element : element.querySelector('input[type="text"]');
  if (!input) return;

  const mask = maskOptions.mask || "";
  const placeholderChar = maskOptions.placeholderChar || "_";
  const lazy = maskOptions.lazy || false;

  let value = input.value;
  let oldValue = value;
  let selectionStart = 0;
  let selectionEnd = 0;

  function update() {
    const maskedValue = applyMask(value, mask, placeholderChar);
    const selection = getSelection(input, selectionStart, selectionEnd);
    input.value = maskedValue;
    setSelection(input, selection.start, selection.end);
  }

  function applyMask(value, mask, placeholderChar) {
    let maskedValue = "";
    let j = 0;

    for (let i = 0; i < mask.length; i++) {
      if (j >= value.length) break;
      if (mask[i] === placeholderChar) {
        maskedValue += value[j];
        j++;
      } else {
        maskedValue += mask[i];
      }
    }

    return maskedValue;
  }

  function getSelection(input, start, end) {
    if (typeof input.selectionStart !== "undefined") {
      return {
        start: input.selectionStart + start,
        end: input.selectionEnd + end
      };
    }
    return null;
  }

  function setSelection(input, start, end) {
    if (typeof input.selectionStart !== "undefined") {
      input.selectionStart = start;
      input.selectionEnd = end;
    }
  }

  input.addEventListener("input", (event) => {
    oldValue = value;
    value = event.target.value;
    selectionStart = event.target.selectionStart - oldValue.length + value.length;
    selectionEnd = event.target.selectionEnd - oldValue.length + value.length;
    update();
  });

  if (!lazy) {
    update();
  }
}
   
   
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
        const wFormFail = document.querySelector('.w-form-fail');
        wFormFail.style.display = 'block';
        wFormFail.textContent = message;
    }

    function clearError() {
        const wFormFail = document.querySelector('.w-form-fail');
        wFormFail.style.display = 'none';
        wFormFail.textContent = '';
    }

    const phone01Input = document.getElementById("phone-01");
   const phone02Input = document.getElementById("phone-02");
   const cpf01Input = document.getElementById("cpf-01");
   const cpf02Input = document.getElementById("cpf-02");

   const phoneMask = IMask(phone01Input, {
      mask: "(00) 0 0000-0000",
      lazy: false,
      placeholderChar: "_"
   });

   const phoneMask2 = IMask(phone02Input, {
      mask: "(00) 0 0000-0000",
      lazy: false,
      placeholderChar: "_"
   });

   const cpfMask = IMask(cpf01Input, {
      mask: "000.000.000-00",
      lazy: false,
      placeholderChar: "_"
   });

   const cpfMask2 = IMask(cpf02Input, {
      mask: "000.000.000-00",
      lazy: false,
      placeholderChar: "_"
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

                if (data.length) {
                    const horariosWithoutKeys = data.map(item => item.horarios);

                    const timeInput = document.getElementById("time-input-2");

                    horariosWithoutKeys.forEach(function(value) {
                        const option = document.createElement("option");
                        option.value = value;
                        option.textContent = value;
                        timeInput.appendChild(option);
                    });

                    timeInput.value = horariosWithoutKeys[0];

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
        document.getElementById("dia-input").value = currentDay;
        document.getElementById("mes-input").value = currentMonth;
        document.getElementById("year-input").value = currentYear;


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
        const atendimentoPresencialSubmit = document.querySelector("#atendimento-presencial-submit");

        atendimentoPresencialSubmit.disabled = true;
        atendimentoPresencialSubmit.textContent = "carregando...";

        const response = await api(`${urlSchedule}/agendamento/criar`, {
            method: "POST",
            body: JSON.stringify(data)
        })

        atendimentoPresencialSubmit.disabled = false;

        if (response.status === 200) {
            const emailForm02 = document.querySelector("#email-form02");
            emailForm02.style.display = "none";

            const wFormDone = document.querySelector(".w-form-done");
            wFormDone.style.display = "block";
        }
    }




    const diaInput = document.querySelector("#dia-input");
    const mesInput = document.querySelector("#mes-input");
    const yearInput = document.querySelector("#year-input");
    const planInput = document.querySelector("#plan-input");

    diaInput.addEventListener("change", handleInputChange);
    mesInput.addEventListener("change", handleInputChange);
    yearInput.addEventListener("change", handleInputChange);
    planInput.addEventListener("change", handleInputChange);

    function handleInputChange() {
        clearError();
        // Get the new input values
        const day = diaInput.value;
        const month = mesInput.value;
        const year = yearInput.value;
        const planInputValue = planInput.value;

        getTimes({
            day,
            year,
            month,
            atendimentoType: planInputValue
        });
    }

    let tipoAtendimento = 0


    const atendimentoEletronicoInput = document.querySelector('#atendimento-eletronico-input');
    const atendimentoPresencialInput = document.querySelector('#atendimento-presencial-input');

    atendimentoEletronicoInput.addEventListener('click', function() {
        console.log("tipoAtendimento", 1);
        tipoAtendimento = 1;
    });

    atendimentoPresencialInput.addEventListener('click', function() {
        console.log("tipoAtendimento", 0);
        tipoAtendimento = 0;
    });


    async function getPlans() {
        const response = await api(`${urlSchedule}/plano`)
        const result = response


        const planInput = document.getElementById("plan-input");

        if(result.length){

            result.forEach(function(value, index) {
                const option = document.createElement("option");
                option.value = value.id;
                option.text = value.descricao;
                planInput.appendChild(option);
            });

            planInput.value = result[0].id;

        }

    }

    getPlans()

    const inputs = document.querySelectorAll("#dia-input, #mes-input, #year-input, #plan-input, #phone-01, #time-input-2, #email-input, #assunto-input");

    inputs.forEach(input => {
        input.addEventListener("change", () => {
            clearError();
        });
    });

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
