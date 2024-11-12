const { PrismaClient } = require('@prisma/client')
const { sqltag } = require('@prisma/client/runtime/library');


const prisma = new PrismaClient()

const insertClient = async function(data){
    try {
        let sql = `INSERT INTO tbl_cliente(nome_fantasia, razao_social, email, telefone, cnpj, cep, senha, cpf_responsavel, nome_responsavel) VALUES 
        (
            '${data.nome_fantasia}',
            '${data.razao_social}',
            '${data.email}',
            '${data.telefone}',
            '${data.cnpj}',
            '${data.cep}',
            '${data.senha}',
            '${data.cpf_responsavel}',
            '${data.nome_responsavel}'
        )`

        let rs = await prisma.$executeRawUnsafe(sql)
        return rs
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateClientPremium = async function(premium, id){
    try {
        let sql = `UPDATE tbl_cliente SET 
                    premium = ${premium}
                    WHERE id = ${id}`
        
        let rs = await prisma.$executeRawUnsafe(sql)
        return rs
    } catch (error) {
        return false
    }
}

const updateClient = async function(data, id) {
    try {
        let sql=`
            UPDATE tbl_cliente 

            SET
                nome_responsavel='${data.nome_responsavel}',
                cpf_responsavel='${data.cpf_responsavel}',
                email='${data.email}',
                nome_fantasia='${data.nome_fantasia}',
                razao_social='${data.razao_social}',
                telefone=${data.telefone},
                cnpj=${data.cnpj},
                cep=${data.cep},
                senha='${data.senha}',
                foto='${data.foto}'

            WHERE id='${id}';
        `
        let rs = await prisma.$executeRawUnsafe(sql)
        return rs
    } catch (error) {
        console.log(error);
        return false
    }
}

const selectClient = async function(){
    try {
        let sql = 'select * from tbl_cliente'
        let rs = await prisma.$queryRawUnsafe(sql)
        return rs
    } catch (error) {
        console.log(error);
        return false
    }
}

const selectClienteId = async function(id){
    try {
        let sql = `SELECT * FROM tbl_cliente WHERE id = ${id}`
        let rs = await prisma.$queryRawUnsafe(sql)
        return rs
    } catch (error) {
        console.log(error);
        return false
    }
}

const selectClientForReturnBico = async function(id) {
    try {
        let sql = `SELECT id, nome_fantasia, cep FROM tbl_cliente WHERE id = ${id}`
        let rs = await prisma.$queryRawUnsafe(sql)
        return rs
    } catch (error) {
        console.log(error);
        return false
    }
}

const updateClientInfos = async function(id, data){
    try {
        let sql = `UPDATE tbl_cliente SET
        email='${data.email}',
        nome_fantasia='${data.nome_fantasia}',
        telefone=${data.telefone},
        cep=${data.cep}
        WHERE id = ${id}`
        let rs = await prisma.$executeRawUnsafe(sql)
        return rs
    } catch (error) {
        return false
    }
}

const callLogin = async function(email, pw){
    try {
        let sql = `CALL sp_login_cliente('${email}', '${pw}');`        
        let rs = await prisma.$queryRawUnsafe(sql)
        return rs
    } catch (error) {
        return false
    }
}

const lastID = async function(){
    try {
        let sql = `SELECT id FROM tbl_cliente ORDER BY id DESC LIMIT 1;`
        let sqlID = await prisma.$queryRawUnsafe(sql)

        return sqlID
    } catch (error) {
        return false
    }
    
}
module.exports ={
    insertClient,
    updateClientPremium,
    updateClient,
    selectClient,
    selectClienteId,
    selectClientForReturnBico,
    updateClientInfos,
    callLogin,
    lastID
}