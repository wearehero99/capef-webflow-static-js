
  async function setupToken() {
        let token = localStorage.getItem('authToken');
        if (!token) {
            const authResponse = await fetch("https://apiparceriapremiada.capef.com.br/Auth/Access-Token", {
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


$(document).ready(function ($) {
   $("#cpf-parceria").mask("999.999.999-99");
});

const api = authFetch;


const errorMsg  = $("#error-msg")
const sucessMsg  = $("#sucess-msg")

async function checkCPFPremiation(cpf){
    const response = await api(`https://apiparceriapremiada.capef.com.br/CPF/${cpf}`);
    const result = response;
}


async function receivePlanPoints(){
    const cpf = $("#cpf-parceria").val()

    const response = await api(`https://apiparceriapremiada.capef.com.br/pontos`, {
        method: "POST",
        body: JSON.stringify({
            cpf: cpf,
            eventoId: 1
        })
    });
    
    console.log("Premiação ", response)

} 


document.querySelector("#receber-pontos").addEventListener("click", ()=> {
	console.log("Receber planos")
});