const getRequestOptions = accessToken => {
  return {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    redirect: 'follow'
  };
};

async function getToken() {
  return await fetch(
    `https://apigraficorentabilidade.capef.com.br/Auth/Access-Token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Hero99',
        password: 'd7OwsEqTXc'
      })
    }
  )
    .then(response => response.json())
    .catch(error => console.log('🚀 ~ error:', error));
}

makeAuthorizedRequest = async () => {
  const token = await getToken();
  const options = getRequestOptions(token.access_Token);

  return await fetch(
    'https://apigraficorentabilidade.capef.com.br/Rentabilidade?planoId=2',
    options
  );
};

async function currentMonth() {
  const apiData = await makeAuthorizedRequest();
  const apiContent = await apiData.json();
  console.log(apiContent);

  const currentMonth = (document.getElementById('current-month').innerText =
    apiContent.listaRetorno[0].periodicidade);

  const [bar01, bar02, bar03] = apiContent.listaRetorno[0].indicadores.map(
    indicador => indicador.valor
  );

  console.log(bar01, bar02, bar03);

  const data = [bar01, bar02, bar03];
  for (let i = 1; i <= data.length; i++) {
    const value = parseFloat(data[i - 1]).toFixed(2);
    document.getElementById(`bar1-${i}`).style.height = `${
      parseFloat(value) * 3
    }rem`;
    document.getElementById(`percentage1-0${i}`).innerText =
      `${value} %`.replace('.', ',');
  }
}
currentMonth();

async function months12() {
  const apiData = await makeAuthorizedRequest();
  const apiContent = await apiData.json();
  console.log(apiContent);

  const currentMonth = (document.getElementById('current-month').innerText =
    apiContent.listaRetorno[0].periodicidade);

  const [bar01, bar02, bar03] = apiContent.listaRetorno[1].indicadores.map(
    indicador => indicador.valor
  );

  console.log(bar01, bar02, bar03);

  const data = [bar01, bar02, bar03];
  for (let i = 1; i <= data.length; i++) {
    const value = parseFloat(data[i - 1]).toFixed(2);
    document.getElementById(`bar2-${i}`).style.height = `${
      parseFloat(value) * 2
    }%`;
    document.getElementById(`percentage2-0${i}`).innerText =
      `${value} %`.replace('.', ',');
  }
}
months12();

async function months36() {
  const apiData = await makeAuthorizedRequest();
  const apiContent = await apiData.json();
  console.log(apiContent);

  const currentMonth = (document.getElementById('current-month').innerText =
    apiContent.listaRetorno[0].periodicidade);

  const [bar01, bar02, bar03] = apiContent.listaRetorno[2].indicadores.map(
    indicador => indicador.valor
  );

  console.log(bar01, bar02, bar03);

  const data = [bar01, bar02, bar03];
  for (let i = 1; i <= data.length; i++) {
    const value = parseFloat(data[i - 1]).toFixed(2);
    document.getElementById(`bar3-${i}`).style.height = `${
      parseFloat(value) * 1
    }%`;
    document.getElementById(`percentage3-0${i}`).innerText =
      `${value} %`.replace('.', ',');
  }
}
months36();

async function months60() {
  const apiData = await makeAuthorizedRequest();
  const apiContent = await apiData.json();
  console.log(apiContent);

  const currentMonth = (document.getElementById('current-month').innerText =
    apiContent.listaRetorno[0].periodicidade);

  const [bar01, bar02, bar03] = apiContent.listaRetorno[3].indicadores.map(
    indicador => indicador.valor
  );

  console.log(bar01, bar02, bar03);

  const data = [bar01, bar02, bar03];
  for (let i = 1; i <= data.length; i++) {
    const value = parseFloat(data[i - 1]).toFixed(2);
    document.getElementById(`bar4-${i}`).style.height = `${
      parseFloat(value) * 1
    }%`;
    document.getElementById(`percentage4-0${i}`).innerText =
      `${value} %`.replace('.', ',');
  }
}
months60();

// Gráfico de rentabilidade
makeAuthorizedRequest02 = async () => {
  const token = await getToken();
  const options = getRequestOptions(token.access_Token);

  return await fetch(
    'https://apigraficorentabilidade.capef.com.br/Indices/Rentabilidade?planoId=2',
    options
  );
};

async function currentMonthGR() {
  const apiData = await makeAuthorizedRequest02();
  const apiContent = await apiData.json();
  console.log(apiContent);

  const grMes = (document.getElementById('gr-mes').innerText =
    apiContent.colunaValores[0].descricao);
  const grAno = (document.getElementById('gr-ano').innerText =
    apiContent.colunaValores[1].descricao);

  const cdiMes = (document.getElementById('cdi-mes').innerText =
    apiContent.listaIndices[0].vr_rentab_mes);
  const cdiAno = (document.getElementById('cdi-ano').innerText =
    apiContent.listaIndices[0].vr_rentab_ano);

  const ibovespaMes = (document.getElementById('ibovespa-mes').innerText =
    apiContent.listaIndices[1].vr_rentab_mes);
  const ibovespaAno = (document.getElementById('ibovespa-ano').innerText =
    apiContent.listaIndices[1].vr_rentab_ano);

  const ifixMes = (document.getElementById('ifix-mes').innerText =
    apiContent.listaIndices[2].vr_rentab_mes);
  const ifixAno = (document.getElementById('ifix-ano').innerText =
    apiContent.listaIndices[2].vr_rentab_ano);

  const imaMes = (document.getElementById('ima-mes').innerText =
    apiContent.listaIndices[3].vr_rentab_mes);
  const imaAno = (document.getElementById('ima-ano').innerText =
    apiContent.listaIndices[3].vr_rentab_ano);

  const ipcaMes = (document.getElementById('ipca-mes').innerText =
    apiContent.listaIndices[3].vr_rentab_mes);
  const ipcaAno = (document.getElementById('ipca-ano').innerText =
    apiContent.listaIndices[3].vr_rentab_ano);
}

currentMonthGR();
