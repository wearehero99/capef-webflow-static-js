

      $(document).ready(function () {
        $("#phone-01").mask("(99) 9 9999-9999");
        $("#phone-02").mask("(99) 9 9999-9999");
        $("#cpf-01").mask("999.999.999-99");
        $("#cpf-02").mask("999.999.999-99");
      });

      function getElement(selector) {
        return document.querySelector(selector);
      }

      function createRegistration() {
        const cpfInputValue = getElement("#cpf-01").value;
        const timeInputValue = getElement("#time-input").value;
        const planInputValue = getElement("#plan-input").value;
        const emailInputValue = getElement("#email-input").value;
        const assuntoInputValue = getElement("#assunto-input").value || null;
        const day = getElement("#dia-input").value;
        const month = getElement("#year-input").value;
        const year = getElement("#mes-input").value;

        console.log("timeInputValue ===> ",timeInputValue)

        if (cpfInputValue && timeInputValue && planInputValue && emailInputValue && phoneValue) {
 
            const dd = phoneValue.substring(0, 2);
            const rest = phoneValue.substring(2);



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
        const tipoAtendimento = personalAssistance.getAttributeNode("aria-selected").value ? 2 : 1;

        const raw = {
          ano: year,
          dia: day,
          mes: month,
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
    