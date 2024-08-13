const express = require('express')
const jwt = require('jsonwebtoken')
const {validationResult, check} = require("express-validator")
const db = require('./db')

const app = express();
const port = 3000;
const secretkey = process.env.SECRET_KEY;


function validarToken(req, res, next){
    const token = req.headers["authorization"];

    if(!token){
        return res.status(403).json({error: "Token de authenticacion no proporcionado"});
    }

    jwt.verify(token, secretkey, (error,decode) => {
        if(error){
            return res.status(401).json({error: "Token de authenticacion invalido"});
        }
        req.usuario = decode;
        console.log("Token Valido!");
        next();
    })
}


app.get("/get-activo",check('codigo').isString(), async (req,res) => {

    const valresult = validationResult(req);
    if(valresult.isEmpty())
    {
        const sql = "SELECT * FROM activos_fijos WHERE codigo = $1";
        const {codigo} = req.query;

        try {
            results = await db.query(sql,[codigo]);
            res.status(200).json(results.rows[0])
        } catch (error) {
            res.status(500)
        }
        
    }else{
        res.send({errors: valresult.array()});
    }

});

app.get("/get-asignaciones", async (req,res)=>{

    const sql = `
    SELECT 
    a.id_asignaciones,
    p.nombres,
    p.n_carnet,
    atj.nombre,
    af.codigo,
    af.descripcion
    FROM asignaciones AS a
    INNER JOIN personas AS p ON p.id_persona = a.personas_id
    INNER JOIN areas_trabajo AS atj ON atj.id_areas_trabajo = p.areas_trabajo_id
    INNER JOIN activos_fijos AS af ON af.id_activo_fijo = a.activos_fijos_id
    ORDER BY a.id_asignaciones ASC LIMIT $1 OFFSET $2;`;


    const {page = 1} = req.query;
    const pageSize = 2;

    const offset = (page - 1) * pageSize;


    try {
        results = await db.query(sql,[parseInt(pageSize),parseInt(offset)])
        res.status(200).json(results.rows)
    } catch (error) {
        res.status(500)
    }

});

app.post("/new-activo",
check('codigo').isString(),
check('activo_id').isInt(),
check('descripcion').isString(),
validarToken,
async (req,res) => {

    const valresult = validationResult(req)
    if(valresult.isEmpty()){
        const sql = "INSERT INTO activos_fijos VALUES (DEFAULT,$1,$2,$3)";
        const {codigo,activo_id,descripcion} = req.query;

        try {
            result = await db.query(sql, [codigo, parseInt(activo_id), descripcion]);
            res.status(200).json({"success":"Nuevo activo registrado!"})
        } catch (error) {
            res.status(500)
        }

    }else{
        res.send({errors: valresult.array()});
    }

});


app.delete("/drop-asignacion",
check('id_asignacion').isInt(),
validarToken,
async (req,res) => {

    const valresult = validationResult(req);
    if(valresult.isEmpty()){

        const sql = "DELETE FROM asignaciones WHERE id_asignaciones = $1";
        const {id_asignacion} = req.query;

        try {
            result = await db.query(sql, [parseInt(id_asignacion)])
            res.status(200).json({"success":"Asignacion de activo eliminada!"});
        } catch (error) {
            res.status(500)   
        }

    }else{
        res.send({errors:valresult.array()});
    }

});

app.post("/new-asignacion",
check('persona_id').isInt(),
check('activo_id').isInt(),
validarToken,
async (req,res) => {

    const valresult = validationResult(req);
    if(valresult.isEmpty()){
        const sql = "INSERT INTO asignaciones VALUES (DEFAULT,$1,$2)";
        const {persona_id,activo_id} = req.query;

        try {
            result = await db.query(sql, [parseInt(persona_id), parseInt(activo_id)])
            res.status(200).json({"success":"Asignacion de activo registrada!"});
        } catch (error) {
            res.status(500)
        }

    }else{
        res.send({errors: valresult.array()});
    }
    
});



app.listen(port,()=>{
    console.log("Servidor en linea!")
})