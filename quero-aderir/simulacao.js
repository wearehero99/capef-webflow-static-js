  const loadingIcon = document.getElementById("loading-icon-simulation");
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

       

         $("#cpf-simulator").mask("999.999.999-99");

        var urlConsulta = "https://apiconsulta.capef.com.br";
        var urlSimulacao = "https://apiplanomercado.capef.com.br";

        async function setupToken({ url }) {
            let token = localStorage.getItem(url);

            if (!token) {
                const authResponse = await fetch(`${url}/Auth/Access-Token`, {
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

                localStorage.setItem(url, token);
            }
        }








        async function authFetch(url, options = {}) {
            try {
                let token = localStorage.getItem(options.key);

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

        function normalizePrice(price) {

            const normalized = price.toString().replace(/\D/g, '');
            const integerPart = normalized.slice(0, -2);
            const decimalPart = normalized.slice(-2);
            const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const normalizedPrice = formattedInteger + '.' + decimalPart;
            return normalizedPrice;

        }





        const api = authFetch;

        async function loadScript() {
            await setupToken({ url: urlConsulta });
            await setupToken({ url: urlSimulacao });
        }

        loadScript()

        async function checkCPF(cpf) {
            const response = await api(`${urlConsulta}/CPF/${cpf.replace(/\./g, "").replace("-", "")}`, { key: urlConsulta });
            if (response.valido) {
                await setupToken({ url: urlConsulta });
                return true;
            } else {
                return false;
            }
        }

        async function getSimulation(cpf) {
            //GET] /Simulador​/{ CPF }/Simular

            const valorContribuicao = document.getElementById("contribution-amount")
            const rendaMensalOutros = document.getElementById("other-monthly-income")
            const rendaMensalCV = document.getElementById("cv-monthly-income")
            const saldoAcumulado = document.getElementById("cv-accumulated-balance")
            const aposentadoriaPrevista = document.getElementById("planned-retirement")
            const saldoAcumuladoOutros = document.getElementById("accumulated-balance-others")

            const response = await api(`${urlSimulacao}/Simulador/${cpf.replace(/\./g, "").replace("-", "")}/Simular`, { key: urlSimulacao });


            rendaMensalCV.innerText = `R$ ${normalizePrice(response.rendaMensalCV)}`
            valorContribuicao.innerText = `R$ ${normalizePrice(response.valorContribuicao)}`
            rendaMensalOutros.innerText = `R$ ${normalizePrice(response.rendaMensalOutros)}`
            saldoAcumulado.innerText = `R$ ${normalizePrice(response.saldoAcumuladoCV)}`
            saldoAcumuladoOutros.innerText = `R$ ${normalizePrice(response.saldoAcumuladoOutros)}`
            aposentadoriaPrevista.innerText = `${response.aposentadoriaPrevista}`

        }

        document.getElementById("cpf-simulator-submit").addEventListener("click", async () => {
            const errorContainer = document.getElementById("simulation-error")
            const errorMsg = document.getElementById("simulation-error-msg")
           
           
            
            errorContainer.style.display = "none"
            errorMsg.innerText = ""

            const simulatorResults = document.getElementById("simulation-results")

            const cpf = document.getElementById("cpf-simulator").value

            const rawCpf = cpf.replace(/\./g, "").replace("-", "")

            if (rawCpf.length !== 11) {
            } else {
                preloader.style.display = "flex";
                if (await checkCPF(cpf)) {
                    simulatorResults.style.display = "flex"
                    simulatorResults.style.opacity = 1
                    getSimulation(cpf)
                } else {
                    errorContainer.style.display = "block"
                    errorMsg.innerText = "CPF não é valido"
                    console.log("CPF não é valido")
                }
                preloader.style.display = "none";
            }
        }
        )