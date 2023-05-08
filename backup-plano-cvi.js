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
                localStorage.removeItem("authToken");
                await setupToken();
                getTimesOfToday();
            }


            if (dataResponse.status === 204) {
                return {
                    status: dataResponse.status
                }
            }


            if (!dataResponse.ok) {
                if (await dataResponse.json()) {
                    const result = await dataResponse.json();

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

Webflow.push(function () {

  const subjects = {
    adesao: 2,
    aporte: 3,
    portabilidade: 4,
  };

  const $forwardButton = $(".next-button");
  const $backButton = $(".link-back");
  const $submitButton = $("#Submit");

  const tabsClass = "multistep-tabs";
  const paneClass = "multistep-tab-pane";
  const linkClass = "multistep-tab-link";
  const successMessage = document.querySelector(".success-message");
  const indicarNovamente = document.getElementById("indicar-novamente");

  const loadingIcon = document.querySelector(
    "#plano-cv1-modal #loading-icon-cv-plan"
  );
  
  const preloader = document.querySelector("#plano-cv1-modal .preloader");
  const formBlock = document.querySelector("#plano-cv1-modal .form-block");
  const form = document.querySelector("#plano-cv1-modal .form");
  const formErrorMessage = document.querySelector(
    "#plano-cv1-modal .w-form-fail"
  );

  // Hide default webflow button
  document.querySelector(
    "#refer-friend-tab2 .gc-button.w-inline-block"
  ).style.display = "none";

  // Fix form block width
  formBlock.style.minWidth = "100%";

  // set preloader and loader style
  loadingIcon.style.display = "block";
  loadingIcon.style.background = "#28343e";
  loadingIcon.style.padding = "10px";
  loadingIcon.style.borderRadius = "6px";
  // black box shadow
  loadingIcon.style.boxShadow =
    "0px 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.2)";

  preloader.style.display = "none";
  preloader.style.opacity = 1;
  preloader.style.justifyContent = "center";
  preloader.style.top = 0;
  preloader.style.left = 0;
  preloader.style.width = "100%";
  preloader.style.height = "300px";

  indicarNovamente.addEventListener("click", () => {
    successMessage.style.display = "none";
    document.querySelector(".multistep-tabs-content").style.display = "block";
  });

  const btnCloseIndicacao = document.querySelectorAll(".btn-close-indicacao");
  btnCloseIndicacao.forEach((item) => {
    item.addEventListener("click", () => {
      window.location.reload();
    });
  });

  successMessage.style.display = "none";

  // Get array of all fields for text inputs, checkboxes and selects
  const fields = $("input, select, textarea").not(
    ":input[type=button], :input[type=submit], :input[type=reset]"
  );

  // Populate fields the user has already filled out
  let usrStore = JSON.parse(localStorage.getItem("usr"));
  let usr = usrStore ? usrStore : {};
  printUsr();

  // Add saveUsr function to fields
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];

    $(field).on("blur change", saveUsr);
  }

  // Add events to navigate form
  // $forwardButton.on("click", moveForward);
  $backButton.on("click", moveBackward);
  $submitButton.on("click", submitForm);

  function moveForward(el) {
    el.preventDefault();
    // Get current click target and form place
    const $target = $(el.currentTarget);
    const currentTab = $target.closest("." + paneClass);
    const tabIndex = $target
      .closest("." + tabsClass)
      .data("current")
      .split(" ")[1];

    let nextIndex = parseInt(tabIndex) + 1;

    // Validate required fields before moving forward
    let valid = validateFields(currentTab);
    if (valid) {
      $target.closest("." + tabsClass).data("current", "Tab " + nextIndex);
      $("." + linkClass).removeClass("w--current");
      $($("." + linkClass)[nextIndex - 1]).addClass("w--current");
      $("." + paneClass).removeClass("w--tab-active");
      $($("." + paneClass)[nextIndex - 1]).addClass("w--tab-active");
    }
  }

  function moveBackward(el) {
    el.preventDefault();
    // Get current click target and form place
    const $target = $(el.currentTarget);
    const currentTab = $target.closest("." + paneClass);
    const tabIndex = $target
      .closest("." + tabsClass)
      .data("current")
      .split(" ")[1];

    let nextIndex = parseInt(tabIndex) - 1;

    // Validate required fields before moving forward
    let valid = validateFields(currentTab);
    if (valid) {
      $target.closest("." + tabsClass).data("current", "Tab " + nextIndex);
      $("." + linkClass).removeClass("w--current");
      $($("." + linkClass)[nextIndex - 1]).addClass("w--current");
      $("." + paneClass).removeClass("w--tab-active");
      $($("." + paneClass)[nextIndex - 1]).addClass("w--tab-active");
    }
  }

  function validateFields(currentTab) {
    // Get required fields
    let requiredFields = $(currentTab).find(
      "input[required], select[required], textarea[required]"
    );
    let required = true;

    $(".required-field").remove();

    // Iterate over required fields
    for (let index = 0; index < requiredFields.length; index++) {
      const $requiredField = $(requiredFields[index]);

      if (!$requiredField.val()) {
        $requiredField.after(
          '<div class="required-field">The ' +
            $requiredField.attr("name").replace(/-/g, " ") +
            " field is required.</div>"
        );

        required = false;
      }
    }
    return required;
  }

  function saveUsr(el) {
    // Get field data and save it to usr
    const $el = $(el.currentTarget);
    let val = $el.val();
    const name = $el.data("name");
    const type = $el.attr("type");
    const fieldTab = $el.data("ftab") ? parseInt($el.data("ftab")) - 1 : "";

    if (val) {
      $el.next(".required-field").remove();
    }

    usr[name] = type === "checkbox" ? $el.prop("checked") : val;

    localStorage.setItem("usr", JSON.stringify(usr));
  }

  function printUsr() {
    // Populate fields with usr data
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      const fieldType = fields[index].type;
      const fieldName = $(field).data("name");
      const fieldTab = parseInt($(field).data("ftab")) - 1;

      if (fieldType !== "checkbox") {
        $(field).val(usr[fieldName]);
      } else {
        if (usr[fieldName]) {
          $(field).prop("checked", true);
          $(field).prev().addClass("w--redirected-checked");
        }
      }
    }
  }

  async function submitForm(e) {
    e.preventDefault();

    // Validation
    let hasErrors = false;
    $(".required-field").remove();

    const name = document.querySelector("#nome-amigo");
    const email = document.querySelector("#email");
    const cpf = document.querySelector("#cpf-form-2");
    const subject = document.querySelector("#Assunto");

    const requiredFields = [name, email, subject];

    // Iterate over required fields
    for (let index = 0; index < requiredFields.length; index++) {
      const $requiredField = $(requiredFields[index]);

      if (!$requiredField.val()) {
        $requiredField
          .parent(".c-input-field")
          .after(
            '<div class="required-field" style="margin-top: -2.5rem; color: #e74c3c;">Campo Obrigatório</div>'
          );

        hasErrors = false;
      }
    }

    if (hasErrors) {
      return;
    }

    // Form data
    const formData = {
      nome: $(name).val(),
      nomeEmail: $(email).val(),
      indicacao: subjects[$(subject).val()],
      cpfIndicando: $(cpf).val(),
    };

   
    await api("https://apiindicacaoplano.capef.com.br/CV/Criar", {
     
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((r) => {
        
        if (r.status !== 201) {
          throw new Error(r.message);
        }

        localStorage.removeItem("usr");
        document.querySelector(".multistep-tabs-content").style.display =
          "none";
        successMessage.style.display = "block";
      })
      .catch((error) => {
        console.log("🚀 ~ error:", error);
        alert("Algo deu errado, por favor tente novamente.");
      });
  }

  const API_AUTH_URL = "https://{API_NAME}.capef.com.br/auth/access-token";
  const API_CPF_VALID_URL =
    "https://apiconsulta.capef.com.br/CPF/{FORMATTED_CPF}";

  const API_NAMES = {
    apiConsulta: "apiconsulta",
  };

  const cpf = getElement("#cpf-form-2");
  const loadingIconCVPlan = getElement("#loading-icon-cv-plan");
  const formCVPlan = getElement("#form-cv-plan");
  const errorMessageFormIndicar = getElement("#refer-friend-error-message");

  function getElement(selector) {
    return document.querySelector(selector);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // somente letras minúsculas são permitidas
    function alphaOnly(event) {
      var value = String.fromCharCode(event.which);
      var pattern = new RegExp(/[a-zA-Z]/i);
      return pattern.test(value);
    }

    $("#email").bind("keypress", alphaOnly);
  });

  const getRequestOptions = (accessToken) => {
    return {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    };
  };

  const formatCPF = (cpf) => cpf.replaceAll(".", "").replaceAll("-", "");

  async function getToken(apiName) {
    return await api(API_AUTH_URL.replace("{API_NAME}", apiName), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Hero99",
        password: "d7OwsEqTXc",
      }),
    })
      .then((response) => response.json())
      .catch((error) => console.log("🚀 ~ error:", error));
  }

  const makeAuthorizedRequest = async (url, apiName) => {

    return await api(url, options)
      .then((response) => response.json())
      .catch((error) => console.log("🚀 ~ error:", error));
  };

  const cpfValid = async (cpf) => {
    const formattedCPF = formatCPF(cpf);
    
    return makeAuthorizedRequest(`https://apiconsulta.capef.com.br/CPF/${formattedCPF}`, "apiConsulta");
  };

   async function checkCPF(cpf) {
        const response = await api(`${urlSchedule}/agendamento/validar/cpf/${cpf}`);
        const data = (await response).json();
        console.log("checkCPF Data ====> ", data);
    }

  getElement("#cpf-form-2-submit").addEventListener("click", async () => {
    formCVPlan.style.display = "none";
    preloader.style.display = "flex";
    form.style.justifyContent = "center";
    formErrorMessage.style.display = "none";

    const validate = await checkCPF(cpf.value);

    if (validate?.valido) {
      getElement("#tab1").style.display = "none";
      getElement("#refer-friend-tab2").style.display = "block";
    } else {
      errorMessageFormIndicar.style.display = "block";
      getElement("#inner-error-message").innerHTML =
        validate && validate[0] ? validate[0] : "Erro ao encontrar CPF";
    }

    preloader.style.display = "none";
    form.style.justifyContent = "initial";
    formCVPlan.style.display = "block";
  });
});
