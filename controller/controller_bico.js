const axios = require('axios')
/** DAO's */
const bicoDAO = require('../model/DAO/bico.js')
const categoriaDAO = require('../model/DAO/categoria.js')
const dificuldadeDAO = require('../model/DAO/dificuldade.js')
const clienteDAO = require('../model/DAO/cliente.js')
/** Controller */
const message = require('./modulo/config.js')
const controller_cliente = require('./controller_cliente.js')
const controller_user = require('./controller_usuario.js')

const postBico = async function(data, contentType) {
    try {
        if(String(contentType).toLowerCase()=='application/json'){            
            if (
                data.titulo == '' || data.titulo == undefined || data.titulo == null || data.titulo.length > 100 ||
                data.descricao == '' || data.descricao == undefined || data.descricao == null || data.descricao.length > 500 ||
                data.horario_inicio == '' || data.horario_inicio == undefined || data.horario_inicio == null || data.horario_inicio.length != 5 ||
                data.data_inicio == '' || data.data_inicio == undefined || data.data_inicio == null || data.data_inicio.length != 10 ||
                data.horario_limite == '' || data.horario_limite == undefined || data.horario_limite == null || data.horario_limite.length != 5 ||
                data.data_limite == '' || data.data_limite == undefined || data.data_limite == null || data.data_limite.length != 10 ||
                data.salario == '' || data.salario == undefined || data.salario == null || isNaN(data.salario) ||
                data.id_dificuldade == '' || data.id_dificuldade == undefined || data.id_dificuldade == null ||
                data.id_categoria == '' || data.id_categoria == undefined || data.id_categoria == null ||
                data.id_cliente == '' || data.id_cliente == undefined || data.id_cliente == null  ||  isNaN(data.id_cliente)
            )
                return message.ERROR_REQUIRED_FIELDS   

            else{
                let json={}
                let rtnDAO=await bicoDAO.insertBico(data)
                if(rtnDAO){
                    let lastID = await bicoDAO.lastID()
                    json.bico =  await bicoDAO.selectBicoByID(lastID[0].id)
                    json.status=message.SUCCESS_CREATED_ITEM.status
                    json.status_code=message.SUCCESS_CREATED_ITEM.status_code
                    json.message=message.SUCCESS_CREATED_ITEM.message
                    return json
                }
                else
                    return message.ERROR_INTERNAL_SERVER_DB
            }
        }
        else
            return message.ERROR_CONTENT_TYPE
    } catch (error) {
         console.error(error)
        return message.ERROR_INTERNAL_SERVER
    }
}

const postCandidate = async function(data, contentType){
    try {
        if(String(contentType).toLowerCase()=='application/json'){
            if (
                data.id_user == '' || data.id_user == undefined || data.id_user == null || isNaN(data.id_user) ||
                data.id_bico == '' || data.id_bico == undefined || data.id_bico == null || isNaN(data.id_bico)
            )
                return message.ERROR_INVALID_ID
            else{
                const user=await controller_user.getUserId(data.id_user)
                const bico=await getBicoByID(data.id_bico)
                if(user&&bico){
                    if(user.status==true&&bico.status==true){
                        let json={}
                        let rtnDAO = await bicoDAO.insertCandidate(data)
                        if(rtnDAO){
                            json.user=user
                            json.bico=bico
                            json.status=message.SUCCESS_CREATED_ITEM.status
                            json.status_code=message.SUCCESS_CREATED_ITEM.status_code
                            json.message=message.SUCCESS_CREATED_ITEM.message
                            return json
                        }
                        else
                            return message.ERROR_INTERNAL_SERVER_DB
                    }
                    else
                        return message.ERROR_NOT_FOUND
                }
                else
                    return message.ERROR_INTERNAL_SERVER_DB
            }
        }
        else
            return message.ERROR_CONTENT_TYPE
    } catch (error) {
        console.error(error);
        return message.ERROR_INTERNAL_SERVER
    }
}

const getBico = async function() {
    try {
        let data=await bicoDAO.selectAllBicos()
        let json={}
        if(data){
            if(data.length>0){
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    let cat = await categoriaDAO.selectCategoryId(element.id_categoria)
                    delete element.id_categoria
                    element.categoria = cat
                    let dif = await dificuldadeDAO.selectDifficultyId(element.id_dificuldade)
                    delete element.id_dificuldade
                    element.dificuldade = dif
                    let cli = await clienteDAO.selectClientForReturnBico(element.id_cliente)
                    delete element.id_cliente
                    element.cliente = cli
                }
                json.bicos=data
                json.quantidade=data.length
                json.status_code=200
                return json
            }else
                return message.ERROR_NOT_FOUND
        }else
            return message.ERROR_INTERNAL_SERVER_DB
    } catch (error) {
        console.error(error)
        return message.ERROR_INTERNAL_SERVER
    }
}

const getBicoByID = async function(id){
    try {
        let idU = id
        if (idU == '' || idU == null || isNaN(idU) || idU == undefined)
            return message.ERROR_INVALID_ID
        else
        {
            let json = {}
            let rtnBico = await bicoDAO.selectBicoByID(idU)
            if (rtnBico) 
            {
                if (rtnBico.length > 0) 
                {
                    let element = rtnBico[0]
                    let cat = await categoriaDAO.selectCategoryId(element.id_categoria)
                    delete element.id_categoria
                    element.categoria = cat
                    let dif = await dificuldadeDAO.selectDifficultyId(element.id_dificuldade)
                    delete element.id_dificuldade
                    element.dificuldade = dif
                    let cli = await clienteDAO.selectClientForReturnBico(element.id_cliente)
                    delete element.id_cliente
                    element.cliente = cli

                    json.bico = element
                    json.status = message.SUCCESS_FOUND_USER.status
                    json.status_code = message.SUCCESS_FOUND_USER.status_code
                    return json
                } 
                else 
                {
                    return message.ERROR_NOT_FOUND
                }
            } 
            else 
            {
                return message.ERROR_INTERNAL_SERVER_DB    
            }
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER
    }
}

const getBicoByCEP = async function(cepUser) {
    try {
        if(cepUser.length!=8 || cepUser==null || cepUser==undefined || cepUser=='' || isNaN(cepUser))
            return message.ERROR_REQUIRED_FIELDS
        else{
            //cepUser = '06622310'
            const url = `https://viacep.com.br/ws/${cepUser}/json/`
            const response = await axios.get(url)
            const jsonUser = response.data
            const clientCEPArray = []
            const bicos = await getBico()
            const clients = await controller_cliente.getClient()
            const clientsAux = clients.cliente
            const clientsArray = clientsAux.map(cliente => ({
                id: cliente.id,
                cep: cliente.cep
            }))
            const bicosArray = bicos.bicos
            for (const bico of bicosArray) {
                let client = await controller_cliente.getClientId(bico.id_cliente)
                clientCEPArray.push(client.cliente.cep)
            }
            const cepsAccepted = []
            const promises = clientCEPArray.map(async (cep) => {
                const url = `https://viacep.com.br/ws/${cep}/json/`
                const response = await axios.get(url)
                const json = response.data
                if (json.erro) {
                    console.log(`Erro ao buscar CEP ${cep}: ${JSON.stringify(json)}`)
                    return
                }
                if (json.bairro && jsonUser.bairro) {
                    if (json.bairro.toUpperCase() === jsonUser.bairro.toUpperCase()) 
                        cepsAccepted.push(cep)
                }
                if (json.localidade && jsonUser.localidade) {
                    if (json.localidade.toUpperCase() === jsonUser.localidade.toUpperCase()) 
                        cepsAccepted.push(cep)
                }
            })
            await Promise.all(promises)
            const idsAccepted = clientsArray
                .filter(cliente => cepsAccepted.includes(cliente.cep))
                .map(cliente => cliente.id)

            const bicosAccepted = bicosArray.filter(bico => idsAccepted.includes(bico.id_cliente))
            const otherBicos = bicosArray.filter(bico => !idsAccepted.includes(bico.id_cliente))
            const result = [...bicosAccepted, ...otherBicos]
            
            const json={}
            json.bicos=result
            json.quantidade=result.length
            json.status_code=200

            return json
        }
    } catch (error) {
        console.error(error)
        return message.ERROR_INTERNAL_SERVER
    }
}

const getBicoByFilter = async function(data, contentType) {
    try {
        if(String(contentType).toLowerCase()=='application/json'){            
            let sql
            let sqlAux
            let json={}
            if(data.turno&&!data.data_inicio){
                if(data.turno==1)
                    //MADRUGADA = 1
                    sql=`WHERE horario_inicio BETWEEN '00:00:00' AND '04:59:59'`
                else if(data.turno==2)
                    //MANHÃ = 2
                    sql=`WHERE horario_inicio BETWEEN '05:00:00' AND '11:59:59'`
                else if(data.turno==3)
                    //TARDE = 3
                    sql=`WHERE horario_inicio BETWEEN '12:00:00' AND '17:59:59'`
                else if(data.turno==4)
                    //NOITE = 4
                    sql=`WHERE horario_inicio BETWEEN '18:00:00' AND '23:59:59'`
                else
                    return message.ERROR_REQUIRED_FIELDS
            }
            else if(data.data_inicio&&!data.turno){                
                if(data.data_inicio.length==10)
                    sql=`WHERE data_inicio='${data.data_inicio}'`
                else
                    return message.ERROR_REQUIRED_FIELDS
            }
            else if(data.turno&&data.data_inicio){
                if(data.turno==1)
                    //MADRUGADA = 1
                    sql=`WHERE horario_inicio BETWEEN '00:00:00' AND '04:59:59'`
                else if(data.turno==2)
                    //MANHÃ = 2
                    sql=`WHERE horario_inicio BETWEEN '05:00:00' AND '11:59:59'`
                else if(data.turno==3)
                    //TARDE = 3
                    sql=`WHERE horario_inicio BETWEEN '12:00:00' AND '17:59:59'`
                else if(data.turno==4)
                    //NOITE = 4
                    sql=`WHERE horario_inicio BETWEEN '18:00:00' AND '23:59:59'`
                else
                    return message.ERROR_REQUIRED_FIELDS

                if(data.data_inicio.length==10)
                    sqlAux=`data_inicio='${data.data_inicio}'`
                else
                    return message.ERROR_REQUIRED_FIELDS

                sql=`${sql} AND ${sqlAux}`
            }
            else
                return message.ERROR_REQUIRED_FIELDS
            let rsDAO=await bicoDAO.selectBicoByFilter(sql)
            if(rsDAO){
                if(rsDAO.length>0){
                    json.bicos=rsDAO
                    json.quantidade=rsDAO.length
                    json.status_code=200
                    return json
                }
                else
                    return message.ERROR_NOT_FOUND
            }
            else
                return message.ERROR_INTERNAL_SERVER_DB
        }
        else
            return message.ERROR_CONTENT_TYPE
    } catch (error) {
        console.error(error);
        return message.ERROR_INTERNAL_SERVER
    }
}

const getBicoClientId = async function (id, contentType) {
    try {
        if (String(contentType).toLowerCase() == 'application/json') {
            let idU = id
            if (idU == '' || idU == null || isNaN(idU) || idU == undefined) {
                return message.ERROR_INVALID_ID
            }
            else {
                let json = {}
                let rtnBico = await bicoDAO.selectBicoClientId(idU)
                console.log(rtnBico)
                if (rtnBico) {
                    if (rtnBico.length > 0) {
                        for (let index = 0; index < rtnBico.length; index++) {
                            const element = rtnBico[index];
                            let cat = await categoriaDAO.selectCategoryId(element.id_categoria)
                            delete element.id_categoria
                            element.categoria = cat
                            let dif = await dificuldadeDAO.selectDifficultyId(element.id_dificuldade)
                            delete element.id_dificuldade
                            element.dificuldade = dif
                        }
                        // let cli = await clienteDAO.selectClienteId(element.id_cliente)
                        // delete element.id_cliente
                        // element.cliente = cli

                        json.bico = rtnBico
                        json.status = message.SUCCESS_CREATED_ITEM.status
                        json.status_code = message.SUCCESS_CREATED_ITEM.status_code
                        return json
                    }
                    else {
                        return message.ERROR_NOT_FOUND
                    }
                }
                else {
                    return message.ERROR_INTERNAL_SERVER_DB
                }
            }
        } else {
            return message.ERROR_CONTENT_TYPE
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER
    }
}

const excluirBico = async(id) => {
    try {
      let idU = id
      if(idU == '' || idU == undefined || isNaN(idU)){
          return message.ERROR_INVALID_ID 
      }else{
             let rtn = await bicoDAO.deleteBico(idU)
  
             if(rtn){
                 return message.SUCCESS_DELETED_ITEM
             }else{
                 return message.ERROR_INTERNAL_SERVER_DB 
             }
     }
    } catch (error) {
     return message.ERROR_INTERNAL_SERVER 
    }
}


module.exports={
    postBico,
    getBico,
    getBicoByID,
    postCandidate,
    getBicoByCEP,
    getBicoByFilter,
    getBicoClientId,
    excluirBico
}