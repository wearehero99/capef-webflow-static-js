 var urlSchedule = "https://apiagendamento.capef.com.br"

      $(document).ready(function () {
        $("#phone-01").mask("(99) 9 9999-9999");
        $("#phone-02").mask("(99) 9 9999-9999");
        $("#cpf-01").mask("999.999.999-99");
        $("#cpf-02").mask("999.999.999-99");
      });

     
      function getElement(selector) {
        return document.querySelector(selector);
      }

      async function getTimes({day, year, month, atendimentoType}){
        const response = fetch(`${urlSchedule}/agendamento/horarios/atendimento/${atendimentoType}/dia/${day}/mes/${month}/ano/${year}`)
        const data = (await response).json()
        console.log("getTimes Data ====>  ", data)
        const horariosWithoutKeys = horariosArray.map(item => item.horarios);
        // retorna os horarios como ["10:30"]
        return horariosWithoutKeys
      }


      async function checkCPF(cpf){
        const response = fetch(`${urlSchedule}/agendamento/validar/cpf/${cpf}`)
        const data = (await response).json()
        console.log("checkCPF Data ====>  ", data)
      }

      async function isAttendAlreadyExist({type, cpf}){
        const response = fetch(`${urlSchedule}/agendamento/existe/atendimento/${type}/cpf/${cpf}`)
        const data = (await response).json()
        console.log("isAttendAlreadyExist Data ====>  ", data)
      }


      function getElement(selector) {
        return document.querySelector(selector);
      }

      function createRegistration() {
      
      console.log("Agendamento createRegistration ")
      
        const cpfInputValue = getElement("#cpf-01").value;
        const timeInputValue = getElement("#time-input-2").value;
        const planInputValue = getElement("#plan-input").value;
        const emailInputValue = getElement("#email-input").value;
        // const assuntoInputValue = getElement("#assunto-input").value || null;
        const day = getElement("#dia-input").value
        const month = getElement("#mes-input").value
        const year = getElement("#year-input").value

        
       // Verify the values
        if (cpfInputValue && timeInputValue && planInputValue && emailInputValue && phoneValue) {
        // Split the phone value
        const dd = phoneValue.substring(0, 2);
        const rest = phoneValue.substring(2);

            console.log(`date ====> ${day} ${month} ${yaer}`)
            console.log(`DD: ${dd}`);
            console.log(`Rest of number: ${rest}`);
            return;

        } else {
            
            console.log("One or more input values are missing.");
            return;
        }

        const dateInputValue = getElement("#date-input").value;
        console.log("🚀 ~ dateInputValue:", dateInputValue);
        const newDate = new Date(dateInputValue.replaceAll("-", ","));
        console.log("🚀 ~ newDate:", newDate);

        const phoneValue = getElement("#phone-01").value;
        let regexPhone = /\((\d{2})\)\s*(\d)\s*(\d{4})-(\d{4})/;
        let match = regexPhone.exec(phoneValue);
        let ddd = match[1];
        let phoneNumber = match[2] + match[3] + "-" + match[4];

        const electronicService = getElement("#atendimento-eletronico-input");
        const personalAssistance = getElement("#atendimento-presencial-input");
        const tipoAtendimento =
          personalAssistance.getAttributeNode("aria-selected").value === "true"
            ? 0
            : electronicService.getAttributeNode("aria-selected").value ===
                "true" && 1;

        const raw = {
          ano: year,
          dia: day,
          mes: newDate.getMonth() + 1,
          plano: planInputValue,
          assunto: tipoAtendimento === 1 && assuntoInputValue,
          horario: timeInputValue,
          cpf: cpfInputValue,
          ddd: ddd,
          telefone: phoneNumber,
          email: emailInputValue,
          tipoAtendimento: tipoAtendimento,
        };
        console.log("🚀 ~ raw:", raw);
      }

      getElement("#atendimento-presencial-submit").addEventListener(
        "click",
        createRegistration
      );
      
    