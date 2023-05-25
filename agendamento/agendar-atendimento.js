    
    document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        }, false);

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.keyCode == 123) {
                e.stopPropagation();
                e.preventDefault();
            }
        });
  
  let tipoAtendimento = 1;


    async function setupToken() {

        const authResponse = await fetch("https://ici002.capef.com.br/apiagendamento/auth/access-token", {
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

    async function authFetch(url, options = {}) {
        try {
            let token = localStorage.getItem('authToken');
            const headers = {
                ...options.headers,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
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

            if (dataResponse.status === 400) {
                const result = await dataResponse.json();

                return {
                    status: dataResponse.status,
                    data: result[0]
                }
            }
            if (dataResponse.status === 204) {
                return {
                    status: dataResponse.status
                }
            }
            if (!dataResponse.ok) {
                if (dataResponse.status === 415) {

                } else

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
            } else {
                const data = await dataResponse.json();
                return data;
            }

        } catch (error) {
            return error
        }
    }


    function clearError() {
        $(".w-form-fail").css("display", "none");
        $(".w-form-fail").text("");
        $("#atendimento-presencial-submit, #atendimento-eletronico-submit").text("Enviar");
        preloader.style.display = "none";
    }
    const api = authFetch;
    var urlSchedule = "https://ici002.capef.com.br/apiagendamento";
    var urlCalend = "https://ici002.capef.com.br/apiagendamento";


    function showFormFailMessage(message) {
        $(".w-form-fail").css("display", "block");
        $(".w-form-fail").text(message);
    }

    function addMask() {
        $("#phone-01").mask("(99) 9 9999-9999");
        $("#phone-02").mask("(99) 9 9999-9999");
        $("#cpf-01").mask("999.999.999-99");
        $("#cpf-02").mask("999.999.999-99");
    };
    $(document).ready(function ($) {
        $("#phone-01").mask("(99) 9 9999-9999");
        $("#phone-02").mask("(99) 9 9999-9999");
        $("#cpf-01").mask("999.999.999-99");
        $("#cpf-02").mask("999.999.999-99");
    });

    const loadingIcon = document.getElementById("loading-icon");
    const preloader = document.getElementById("preloader");
    loadingIcon.style.background = "#28343e";
    loadingIcon.style.padding = "10px";
    loadingIcon.style.borderRadius = "6px";
    loadingIcon.style.boxShadow = "0px 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.2)";
    if (preloader) {
        preloader.style.display = "none";
        preloader.style.opacity = 1;
        preloader.style.position = "fixed";
        preloader.style.top = 0;
        preloader.style.left = 0;
        preloader.style.width = "100%";
        preloader.style.height = "100%";
    }

    function getElement(selector) {
        return document.querySelector(selector);
    }

    async function getPlans() {
        const response = await api(`${urlSchedule}/plano`);
        const result = response;
        const planInput = $("#plan-input");
        const planInput2 = $("#plan-input-2");
        planInput.empty();
        planInput2.empty();
        $.each(result, function (index, value) {
            planInput.append("<option value='" + value.id + "'>" + value.descricao + "</option>");
            planInput2.append("<option value='" + value.id + "'>" + value.descricao + "</option>");
        });
        planInput.val(result[0].id);
        planInput2.val(result[0].id);
    }

    async function getTimes({
        day,
        year,
        month,
        atendimentoType
    }) {

        const timeInput = $("#time-input-2");
        const timeInput2 = $("#horario-2");


        timeInput.empty();
        timeInput2.empty();

        const attId = atendimentoType;
        try {
            const response = await api(`${urlCalend}/horarios/atendimento/${attId}/dia/${day}/mes/${month}/ano/${year}`);
            const data = response;
            if (data.status === 204) {
                showFormFailMessage("Sem horarios disponível para está data");
                return;
            } else {
                if (data.error) {
                    console.log("error ===> ", data.error);
                    return;
                }
                clearError();
                if (data.length) {
                    const horariosWithoutKeys = data.map(item => item.horarios);

                    timeInput.empty();
                    timeInput2.empty();

                    $.each(horariosWithoutKeys, function (index, value) {
                        timeInput.append("<option value='" + value + "'>" + value + "</option>");
                        timeInput2.append("<option value='" + value + "'>" + value + "</option>");

                    });
                    timeInput2.val(horariosWithoutKeys[0]);
                    timeInput.val(horariosWithoutKeys[0]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function checkCPF(cpf) {
        const response = await api(`${urlSchedule}/agendamento/validar/cpf/${cpf}`);
        const data = (await response).json();
    }



    function loadDaysOfMonth(selectElement, days) {

        selectElement.empty();

        for (let day in days) {
            const option = $("<option>").val(days[day]).text(days[day]);
            selectElement.append(option);
        }
    }

    function loadYears(selectElement, years) {

        selectElement.empty();

        for (let year in years) {
            const option = $("<option>").val(years[year]).text(years[year]);
            selectElement.append(option);
        }
    }

    function loadMonths(selectElement, months) {

        selectElement.empty();

        for (let month in months) {
            const monthStr = months[month].descricao.charAt(0).toUpperCase() + months[month].descricao.slice(1)
            const option = $("<option>").val(months[month].mes).text(monthStr);
            selectElement.append(option);
        }
    }



    async function loadCalendar() {
         preloader.style.display = "flex"
        const response = await api(`${urlSchedule}/calendario/atendimento/${tipoAtendimento}`);
         preloader.style.display = "none"
        const result = response[0];

        const diaEleme = $("#dia-input");
        const diaEleme2 = $("#dia-input-2");

        const mesElem = $("#mes-input");
        const mesElem2 = $("#mes-input-2")

        const ano1 = $("#year-input");
        const ano2 = $("#year-input-2")

        loadDaysOfMonth(diaEleme, result.dias)
        loadDaysOfMonth(diaEleme2, result.dias)

        loadMonths(mesElem, result.mes)
        loadMonths(mesElem2, result.mes)

        loadYears(ano1, result.ano)
        loadYears(ano2, result.ano)

        getTimesOfToday()
    }

    loadCalendar()


    async function getTimesOfToday() {
        const day = $(tipoAtendimento === 1 ? "#dia-input" : "#dia-input-2").val();
        const month = $(tipoAtendimento === 1 ? "#mes-input" : "#mes-input-2").val();
        const year = $(tipoAtendimento === 1 ? "#year-input" : "#year-input-2").val();

        console.log(day, month, year)

        getTimes({
            day,
            year,
            month: month,
            atendimentoType: tipoAtendimento
        });
    }

    async function isAttendAlreadyExist({
        typeAtt,
        cpf
    }) {
        const response = await api(`${urlSchedule}/agendamento/existe/atendimento/${typeAtt}/cpf/${cpf}`);
        const result = response;

        if (result.status === 400) {
            clearError();
            showFormFailMessage("CPF não encontrado");
            return false;
        } else {
            clearError();
            const data = response;
            return true;
        }
    }

    async function scheduleAttend(data) {
        clearError();
        $("#atendimento-presencial-submit, #atendimento-eletronico-submit").prop("disabled", true);
        $("#atendimento-presencial-submit, #atendimento-eletronico-submit").text("carregando...");

        const response = await api(`${urlSchedule}/agendamento/criar`, {
            method: "POST",
            body: JSON.stringify(data)
        });



        $("#atendimento-presencial-submit, #atendimento-eletronico-submit").prop("disabled", false);
        $("#atendimento-presencial-submit, #atendimento-eletronico-submit").text("Enviar");

        if (response.id) {
            $(".tab-button-box, .c-input-form, .c-input-form, .c-input-form, .c-input-tab, .c-input-form ").css("display", "none");
            $(".w-form-done").css("display", "block");
        } else {
            showFormFailMessage(response.data);
        }
    }

    function getElement(selector) {
        return document.querySelector(selector);
    }
    async function loadScript() {

        await setupToken();

        await loadCalendar()

        $("#dia-input, #mes-input, #year-input, #plan-input, #dia-input-2, #mes-input-2, #year-input-2, #plan-input-2").change(function () {
            clearError();
            const day = $(tipoAtendimento === 1 ? "#dia-input" : "#dia-input-2").val();
            const month = $(tipoAtendimento === 1 ? "#mes-input" : "#mes-input-2").val();
            const year = $(tipoAtendimento === 1 ? "#year-input" : "#year-input-2").val();


            getTimes({
                day,
                year,
                month: Number(month) + 1,
                atendimentoType: tipoAtendimento
            });
        });

        $("#atendimento-eletronico-input").click(async function () {
            clearError();
            addMask();
            await getPlans();
            tipoAtendimento = 2;
        });
        $("#atendimento-presencial-input").click(async function () {
            clearError();
            addMask();
            await getPlans();
            tipoAtendimento = 1;
        });
        await  getPlans();
        $("#dia-input, #mes-input, #year-input, #plan-input,#mes-input-2, #year-input-2, #plan-input-2, #phone-01,#phone-02, #time - input - 2, #email - input, #email - input - 2, #assunto - input").change(function () {
            clearError();
        })
    }

    loadScript();


    async function createRegistration() {
        clearError();
        const phoneValue = getElement(tipoAtendimento === 1 ? "#phone-01" : "#phone-02").value;
        const cpfInputValue = getElement(tipoAtendimento === 1 ? "#cpf-01" : "#cpf-02").value;
        const timeInputValue = getElement(tipoAtendimento === 1 ? "#time-input-2" : "#horario-2").value;
        const planInputValue = getElement(tipoAtendimento === 1 ? "#plan-input" : "#plan-input-2").value;
        const emailInputValue = getElement(tipoAtendimento === 1 ? "#email-input" : "#email-input-2").value;
        const assuntoInputValue = getElement("#assunto-input") ? getElement("#assunto-input").value : "";
        const day = getElement(tipoAtendimento === 1 ? "#dia-input" : "#dia-input-2").value;
        const month = getElement(tipoAtendimento === 1 ? "#mes-input" : "#mes-input-2").value;
        const year = getElement(tipoAtendimento === 1 ? "#year-input" : "#year-input-2").value;
        const phoneDDD = phoneValue.replace("(", "").replace(")", "").substring(0, 3);
        const phoneRest = phoneValue.replace("(", "").replace(")", "").substring(3);

        if (cpfInputValue && timeInputValue && planInputValue && emailInputValue && phoneValue) {

            preloader.style.display = "flex";

            const resultCPF = await isAttendAlreadyExist({
                cpf: cpfInputValue.replace(/\./g, "").replace("-", ""),
                typeAtt: tipoAtendimento
            });

            console.log("resultCPF", resultCPF)

            if (resultCPF) {

                const raw = {
                    ano: year,
                    dia: day,
                    mes: Number(month) + 1,
                    plano: planInputValue,
                    assunto: tipoAtendimento,
                    horario: timeInputValue,
                    cpf: cpfInputValue.replace(/\./g, "").replace("-", ""),
                    ddd: phoneDDD.replace(" ", ""),
                    telefone: phoneRest.replace(" ", "").replace("-", ""),
                    email: emailInputValue,
                    tipoAtendimento: tipoAtendimento,
                };

                await scheduleAttend(raw);

                preloader.style.display = "none";
            }
            $("#atendimento-presencial-submit, #atendimento-eletronico-submit").text("Enviar");

            preloader.style.display = "none";
            return;
        } else {
            showFormFailMessage("Todos os campos são obrigatórios");
            console.log("One or more input values are missing.");
            return;
        }
    }

    document.querySelector("#atendimento-presencial-submit").addEventListener("click", createRegistration);
    document.getElementById("atendimento-eletronico-submit").addEventListener("click", createRegistration);