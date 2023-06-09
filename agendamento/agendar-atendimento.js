 let tipoAtendimento = 1;

    const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];


    async function setupToken() {
        let token = localStorage.getItem('authToken');
        if (!token) {
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

            if (dataResponse.status === 400) {
                const result = await dataResponse.json();
                return {
                    status: dataResponse.status,
                    data: result[0]
                }
            }


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
            console.log("error");
        }
    }

    async function checkCPF(cpf) {
        const response = await api(`${urlSchedule}/agendamento/validar/cpf/${cpf}`);
        const data = (await response).json();
    }

    function loadDaysOfMonth(selectElement, selectedMonth) {

        selectElement.empty();

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        let currentDay = 1;


        let daysInMonth = 31;

        if (selectedMonth === currentMonth) {
            currentDay = currentDate.getDate();
        }

        for (let day = currentDay; day <= daysInMonth; day++) {
             const date = new Date(selectedMonth + "/" + day + "/" + currentDate.getFullYear());
                const dayOfWeek = date.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const option = $("<option>").val(day).text(day);
                    selectElement.append(option);
                
                }
        }


    }

    function loadMonths(selectElement) {

        selectElement.empty();


        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();


        for (let i = currentMonth; i < monthNames.length; i++) {
            const option = $("<option>").val(i).text(monthNames[i]);
            selectElement.append(option);
        }
    }

    const diaEleme = $("#dia-input");
    const diaEleme2 = $("#dia-input-2");
    const mesElem = $("#mes-input");
    const mesElem2 = $("#mes-input-2");

    async function getTimesOfToday() {
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        loadMonths(mesElem);
        loadMonths(mesElem2);

        loadDaysOfMonth(diaEleme, currentMonth);
        loadDaysOfMonth(diaEleme2, currentMonth);

        getTimes({
            day: currentDay,
            year: currentYear,
            month: currentMonth,
            atendimentoType: tipoAtendimento
        });
    }


    mesElem2.on("change", function () {
        loadDaysOfMonth(diaEleme2, Number(mesElem2.val()) + 1);
    });

    mesElem.on("change", function () {
        loadDaysOfMonth(diaEleme, Number(mesElem.val()) + 1);
    });

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
        }  else {
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
            //.solicitation-form-2
            $(".solicitation-form-2").css("display", "none");
            $("#email-form02").css("display", "none");
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
        getTimesOfToday();

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
        getPlans();
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
            return;
        }
    }

    document.querySelector("#atendimento-presencial-submit").addEventListener("click", createRegistration);
    document.getElementById("atendimento-eletronico-submit").addEventListener("click", createRegistration);