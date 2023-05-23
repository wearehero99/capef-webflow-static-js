

    var urlIndicacao = "https://ici002.capef.com.br/apiindicacaoplano";
    const successContainer = document.getElementById("modal-success-indication")
    const errorMsg = document.getElementById("modal-error-indication-msg")
    const errorContainer = document.getElementById("modal-error-indication")
    const loadingIcon = document.getElementById("loading-icon-cv-plan");
    const choicesIndication = document.getElementById("choices-indication")
    const formContainer = document.getElementById("wf-form-plano_familia-indicacao")
     const modalWa = document.getElementById("modal-wa")
    const modalEmail = document.getElementById("modal-email")

    const preloader = document.querySelector(".preloader");

    loadingIcon.style.display = "block";
    loadingIcon.style.background = "#28343e";
    loadingIcon.style.padding = "10px";
    loadingIcon.style.borderRadius = "6px";
   
    loadingIcon.style.boxShadow = "0px 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.2)";

    preloader.style.display = "none";
    preloader.style.opacity = 1;
    preloader.style.justifyContent = "center";
    preloader.style.top = 0;
    preloader.style.left = 0;
    preloader.style.width = "100%";
    preloader.style.height = "300px";

    async function setupToken({ url }) {

      const authResponse = await fetch(`${url}/auth/access-token`, {
        method: "POST",
        body: JSON.stringify({
          userName: "Hero99",
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

      localStorage.setItem(urlIndicacao, token);

    }

    async function authFetch(url, options = {}) {

      try {
        preloader.style.display = "flex";

        let token = localStorage.getItem(urlIndicacao);

        const headers = {
          ...options.headers,
          "Authorization": `Bearer ${token}`
        };

        const dataResponse = await fetch(url, {
          ...options,
          headers
        });

        preloader.style.display = "none";

        if (dataResponse.status === 401) {
          localStorage.removeItem(options.key);
          await setupToken({
            url: options.key
          });
        }

        if (dataResponse.status === 204) {
          return {
            status: dataResponse.status
          }
        }

        if (!dataResponse.ok) {

          const res = await dataResponse.json();

          if (res) {
            const result = res;

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

    const api = authFetch;
    
     function sendWhatsAppMessage(phone, id) {

      var message = encodeURIComponent(`
      VOCÊ ACABA DE RECEBER UMA INDICAÇÃO !
      \n\n
      Alguém que se importa com você te convidou para construir um futuro de possibilidades, 
      por meio da pré-inscrição no Plano Família, novo 
      Plano de Previdência destinado aos familiares dos 
      funcionários do BNB/Empresas coligadas.
      \n\n
      Clique no link a seguir para garantir a sua pré-inscrição 
      https://planofamilia.capef.com.br/preinscricao?id=${id}
      `);

      var url = "https://api.whatsapp.com/send?phone=" + phone + "&text=" + message;

      window.open(url, "_blank");
    }
    
    const customError = "Erro desconhecido, actualize a pagina e tente novamente"


    async function indicateByWhatsapp() {
      errorContainer.style.display = "none"

      const cpf = document.getElementById("CPF").value.replace(/\./g, "").replace("-", "")
      const celular = document.getElementById("Whatsapp").value
    
      const isPhoneValid = celular.length === 11;

      if (isPhoneValid) {
        const response = await api(`${urlIndicacao}/familia/criar/wa`, {
          method: "Post",
          body: JSON.stringify({
            cpf,
            celular
          }),
          headers: {
            "Content-Type": "application/json"
          }
        })
        
        if (response.id) {
        
        	const id = response.id
          
          formContainer.style.display = "none"
          successContainer.style.display = "flex"
					
          await sendWhatsAppMessage(celular, id)

        } else {
          errorContainer.style.display = "block"
          errorMsg.style.display = "block"
           if (response.error) {
            errorMsg.innerText = response.error
          } else {
            errorMsg.innerText = customError
          }
        }
      } else {
        errorContainer.style.display = "block"
        errorMsg.style.display = "block"
        errorMsg.innerText = "Celular inválido"
      }
    }

    async function indicateByEmail() {
      errorContainer.style.display = "none"

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cpf = document.getElementById("CPF").value.replace(/\./g, "").replace("-", "")
      const email = document.getElementById("e-mail-3").value
     
      const isEmailValid = emailRegex.test(email);

      if (isEmailValid) {
        const response = await api(`${urlIndicacao}/familia/criar/email`, {
          method: "Post",
          body: JSON.stringify({
            cpf,
            email
          }),
          headers: {
            "Content-Type": "application/json"
          }
        })

        if (response.id) {
        
        const id = response.id

          formContainer.style.display = "none"
          successContainer.style.display = "flex"
          
        } else {
          errorContainer.style.display = "block"
          errorMsg.style.display = "block"
          if (response.error) {
            errorMsg.innerText = response.error
          } else {
            errorMsg.innerText = customError
          }
        }
      } else {
        errorContainer.style.display = "block"
        errorMsg.style.display = "block"
        errorMsg.innerText = "Email inválido"
        console.log("Email inválido")
      }

    }

    async function loadScript() {

			$("#CPF").mask("999.999.999-99")
      //$("#Whatsapp").mask("(99) 9 9999-9999");

      await setupToken({
        url: urlIndicacao
      })

      const inputFields = document.querySelectorAll("#CPF");

      const submitBtn = document.getElementById("clear-email");
      submitBtn.disabled = true;

      async function checkCPF(cpf) {
        const response = await api(`${urlIndicacao}/indicador/${cpf}/planof`);
        return response
      }

      async function validateFields() {

        const errorMsg = document.getElementById("error-msg")
        const errorContainer = document.getElementById("msg-ctn")
        const modalIndication = document.getElementById("plano-cv1-modal")

        errorContainer.style.display = "none";

        const cpf = document.getElementById("CPF").value.replace(/\./g, "").replace("-", "")

        const isCPFValid = cpf.length === 11;

        if (!isCPFValid) {
          errorContainer.style.display = "block"
          errorMsg.style.display = "block"
          errorMsg.innerText = "CPF inválido"
        } else {
          const result = await checkCPF(cpf)
          if (result.id) {
            modalIndication.style.display = "flex"
          } else {
            errorContainer.style.display = "block"
            errorMsg.style.display = "block"
            if(result.error){
              errorMsg.innerText = result.error
            }
          }

        }
      }

      submitBtn.addEventListener("click", async () => {
        validateFields()
      }
      )
    }

    loadScript()

    document.getElementById("btn-send-wa").addEventListener("click", async () => {
      await indicateByWhatsapp()
    }
    )

    document.getElementById("btn-send-email").addEventListener("click", async () => {
      await indicateByEmail()
    }
    )
    
     document.getElementById("btn-indicate-again").addEventListener("click", async () => {
     document.getElementById("Whatsapp").value = ""
       document.getElementById("e-mail-3").value = ""

      successContainer.style.display = "none"
      formContainer.style.display = "flex"
      choicesIndication.style.display = "flex"
      modalEmail.style.display = "none"
      modalWa.style.display = "none"
      successContainer.style.display = "none"
    }
    )


    document.getElementById("close-modal").addEventListener("click", async () => {
       document.getElementById("Whatsapp").value =  ""
     document.getElementById("e-mail-3").value = ""
       document.getElementById("CPF").value = ""

      successContainer.style.display = "none"
      formContainer.style.display = "none"
      successContainer.style.display = "none"
      modalIndication.style.display = "flex"
    }
    )
  
function increaseFontSize() {
  const elements = document.getElementsByClassName('increase-font-size');
  
  for (var i = 0; i < elements.length; i++) {
    var fontSize = parseInt(window.getComputedStyle(elements[i]).fontSize);
    elements[i].style.fontSize = (fontSize + 1) + 'px';
  }
}
	document.getElementById("increaseFontSize").addEventListener("click", () => {
	increaseFontSize()
})

function decreaseFontSize() {
  const elements = document.getElementsByClassName('decrease-font-size');

  for (var i = 0; i < elements.length; i++) {
    var fontSize = parseInt(window.getComputedStyle(elements[i]).fontSize);
    elements[i].style.fontSize = (fontSize - 1) + 'px';
  }
}
document.getElementById("decreaseFontSize").addEventListener("click", () => {
  decreaseFontSize();
});