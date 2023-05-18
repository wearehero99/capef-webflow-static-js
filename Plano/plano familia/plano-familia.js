

  var urlIndicacao = "https://ici002.capef.com.br/apiindicacaoplano";

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
      let token = localStorage.getItem(urlIndicacao);

      const headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
      };

      const dataResponse = await fetch(url, {
        ...options,
        headers
      });

      if (dataResponse.status === 401) {
        localStorage.removeItem(options.key);
        await setupToken({ url: options.key });
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

  async function indicateByWhatsapp() {

    const cpf = document.getElementById("CPF").value.replace(/\./g, "").replace("-", "")
    const email = document.getElementById("email")


    const response = await api(`${urlIndicacao}/familia/criar/wa`, {
      method: "Post",
      body: JSON.stringify({
        cpf: "",
        celular: ""
      })
    })

    if (response.id) {
      console.log("Indicação criada com sucesso")
    } else {
      console.log(response)
    }
  }

  async function indicateByEmail() {
    const cpf = document.getElementById("CPF").value.replace(/\./g, "").replace("-", "")

    const response = await api(`${urlIndicacao}/familia/criar/email`, {
      method: "Post",
      body: JSON.stringify({
        cpf: "",
        email: ""
      })
    })

    if (response.id) {
      console.log("Indicação criada com sucesso")
    } else {
      console.log(response)
    }

  }


  async function loadScript() {

    await setupToken({ url: urlIndicacao })

    const api = authFetch;

    // $("#CPF").mask("999.999.999-99")
    // $("#phone-01").mask("(99) 9 9999-9999");

    const inputFields = document.querySelectorAll("#CPF");

    const submitBtn = document.getElementById("clear-email");
    submitBtn.disabled = true;

    const errorMsg = document.getElementById("error-msg")
    const errorContainer = document.getElementById("msg-ctn")
    const success = document.getElementById("success-msg")

    // inputFields.forEach((input) => {
    //   input.addEventListener("keyup", validateFields);
    // });

    async function checkCPF(cpf) {
      const response = await api(`${urlIndicacao}/indicador/${cpf}/planof`);
      return response
    }

    async function validateFields() {

      const cpf = document.getElementById("CPF").value.replace(/\./g, "").replace("-", "")

      const isCPFValid = cpf.length === 11;

      if (!isCPFValid) {
        // errorContainer.style.display = "block"
        // errorMsg.style.display = "block"
        // errorMsg.innerText = "CPF inválido"
        console.log("CPF inválido")
      } else {

        const result = await checkCPF(cpf)
        if (result.id) {
          console.log("CPF valido")
          submitBtn.disabled = false;
        } else {
          console.log("cpf não existe na base consultada", result.data)
        }

        //errorContainer.style.display = "none";
      }
    }

    submitBtn.addEventListener("click", async () => {
      validateFields()
    })
  }

  loadScript()
