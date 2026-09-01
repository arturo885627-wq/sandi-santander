const http = require("http");

const fs = require("fs");

const path = require("path");

const PORT = 3000;

/* =========================================

   ARCHIVOS DE DATOS

========================================= */

const archivoEncuestas =

    path.join(__dirname, "encuestas-demo.json");

const archivoComentarios =

    path.join(__dirname, "comentarios-demo.json");

/* =========================================

   CREAR ARCHIVOS SI NO EXISTEN

========================================= */

if (!fs.existsSync(archivoEncuestas)) {

    fs.writeFileSync(

        archivoEncuestas,

        "[]",

        "utf8"

    );

}

if (!fs.existsSync(archivoComentarios)) {

    fs.writeFileSync(

        archivoComentarios,

        "[]",

        "utf8"

    );

}

/* =========================================

   LEER ENCUESTAS

========================================= */

function obtenerEncuestas() {

    try {

        return JSON.parse(

            fs.readFileSync(

                archivoEncuestas,

                "utf8"

            )

        );

    } catch (error) {

        console.error(

            "Error leyendo encuestas:",

            error

        );

        return [];

    }

}

/* =========================================

   LEER COMENTARIOS

========================================= */

function obtenerComentarios() {

    try {

        return JSON.parse(

            fs.readFileSync(

                archivoComentarios,

                "utf8"

            )

        );

    } catch (error) {

        console.error(

            "Error leyendo comentarios:",

            error

        );

        return [];

    }

}

/* =========================================

   GUARDAR ENCUESTAS

========================================= */

function guardarEncuestas(datos) {

    fs.writeFileSync(

        archivoEncuestas,

        JSON.stringify(

            datos,

            null,

            2

        ),

        "utf8"

    );

}

/* =========================================

   GUARDAR COMENTARIOS

========================================= */

function guardarComentarios(datos) {

    fs.writeFileSync(

        archivoComentarios,

        JSON.stringify(

            datos,

            null,

            2

        ),

        "utf8"

    );

}

/* =========================================

   SERVIR ARCHIVOS

========================================= */

function servirArchivo(

    res,

    archivo,

    tipo

) {

    fs.readFile(

        archivo,

        (error, contenido) => {

            if (error) {

                res.writeHead(404, {

                    "Content-Type":

                        "text/plain; charset=utf-8"

                });

                res.end(

                    "Archivo no encontrado"

                );

                return;

            }

            res.writeHead(

                200,

                {

                    "Content-Type": tipo

                }

            );

            res.end(contenido);

        }

    );

}

/* =========================================

   RESPUESTA JSON

========================================= */

function responderJSON(

    res,

    codigo,

    datos

) {

    res.writeHead(

        codigo,

        {

            "Content-Type":

                "application/json; charset=utf-8"

        }

    );

    res.end(

        JSON.stringify(datos)

    );

}

/* =========================================

   LEER CUERPO JSON

========================================= */

function leerJSON(

    req,

    callback

) {

    let cuerpo = "";

    req.on(

        "data",

        parte => {

            cuerpo += parte;

        }

    );

    req.on(

        "end",

        () => {

            try {

                const datos =

                    JSON.parse(cuerpo || "{}");

                callback(

                    null,

                    datos

                );

            } catch (error) {

                callback(

                    error,

                    null

                );

            }

        }

    );

}

/* =========================================

   SERVIDOR

========================================= */

const servidor =

    http.createServer(

        (req, res) => {

            /* =============================

               INDEX

            ============================= */

            if (

                req.method === "GET" &&

                req.url === "/"

            ) {

                servirArchivo(

                    res,

                    path.join(

                        __dirname,

                        "index.html"

                    ),

                    "text/html; charset=utf-8"

                );

                return;

            }

            /* =============================

               ADMIN

            ============================= */

            if (

                req.method === "GET" &&

                req.url === "/admin"

            ) {

                servirArchivo(

                    res,

                    path.join(

                        __dirname,

                        "admin.html"

                    ),

                    "text/html; charset=utf-8"

                );

                return;

            }

            /* =============================

               OBTENER ENCUESTAS

            ============================= */

            if (

                req.method === "GET" &&

                req.url === "/api/encuesta-demo"

            ) {

                const encuestas =

                    obtenerEncuestas();

                responderJSON(

                    res,

                    200,

                    encuestas

                );

                return;

            }

            /* =============================

               GUARDAR ENCUESTA

            ============================= */

            if (

                req.method === "POST" &&

                req.url === "/api/encuesta-demo"

            ) {

                leerJSON(

                    req,

                    (error, datos) => {

                        if (error) {

                            responderJSON(

                                res,

                                400,

                                {

                                    ok: false,

                                    mensaje:

                                        "Datos inválidos."

                                }

                            );

                            return;

                        }

                        if (

                            !datos.folio ||

                            !datos.respuesta1 ||

                            !datos.respuesta2 ||

                            !datos.tarjeta

                        ) {

                            responderJSON(

                                res,

                                400,

                                {

                                    ok: false,

                                    mensaje:

                                        "Faltan datos de la encuesta."

                                }

                            );

                            return;

                        }

                        const encuestas =

                            obtenerEncuestas();

                        encuestas.push({

                            fecha:

                                new Date()

                                .toLocaleString(

                                    "es-MX"

                                ),

                            folio:

                                String(

                                    datos.folio

                                ),

                            respuesta1:

                                String(

                                    datos.respuesta1

                                ),

                            respuesta2:

                                String(

                                    datos.respuesta2

                                ),

                            tarjeta:

                                String(

                                    datos.tarjeta

                                )

                        });

                        guardarEncuestas(

                            encuestas

                        );

                        responderJSON(

                            res,

                            200,

                            {

                                ok: true,

                                mensaje:

                                    "Encuesta guardada correctamente."

                            }

                        );

                    }

                );

                return;

            }

            /* =============================

               OBTENER COMENTARIOS

            ============================= */

            if (

                req.method === "GET" &&

                req.url === "/api/comentario-demo"

            ) {

                const comentarios =

                    obtenerComentarios();

                responderJSON(

                    res,

                    200,

                    comentarios

                );

                return;

            }

            /* =============================

               GUARDAR COMENTARIO

            ============================= */

            if (

                req.method === "POST" &&

                req.url === "/api/comentario-demo"

            ) {

                leerJSON(

                    req,

                    (error, datos) => {

                        if (error) {

                            responderJSON(

                                res,

                                400,

                                {

                                    ok: false,

                                    mensaje:

                                        "Datos inválidos."

                                }

                            );

                            return;

                        }

                        if (

                            !datos.folio ||

                            !datos.comentario

                        ) {

                            responderJSON(

                                res,

                                400,

                                {

                                    ok: false,

                                    mensaje:

                                        "Faltan datos del comentario."

                                }

                            );

                            return;

                        }

                        const comentarios =

                            obtenerComentarios();

                        comentarios.push({

                            fecha:

                                new Date()

                                .toLocaleString(

                                    "es-MX"

                                ),

                            folio:

                                String(

                                    datos.folio

                                ),

                            comentario:

                                String(

                                    datos.comentario

                                )

                        });

                        guardarComentarios(

                            comentarios

                        );

                        responderJSON(

                            res,

                            200,

                            {

                                ok: true,

                                mensaje:

                                    "Comentario guardado correctamente."

                            }

                        );

                    }

                );

                return;

            }

            /* =============================

               IMÁGENES

            ============================= */

            if (

                req.method === "GET" &&

                req.url.startsWith(

                    "/imagenes/"

                )

            ) {

                const nombre =

                    path.basename(

                        req.url

                    );

                const archivo =

                    path.join(

                        __dirname,

                        "imagenes",

                        nombre

                    );

                const extension =

                    path.extname(

                        nombre

                    ).toLowerCase();

                const tipos = {

                    ".jpg":

                        "image/jpeg",

                    ".jpeg":

                        "image/jpeg",

                    ".png":

                        "image/png",

                    ".gif":

                        "image/gif",

                    ".webp":

                        "image/webp"

                };

                servirArchivo(

                    res,

                    archivo,

                    tipos[extension] ||

                    "application/octet-stream"

                );

                return;

            }

            /* =============================

               404

            ============================= */

            res.writeHead(

                404,

                {

                    "Content-Type":

                        "text/plain; charset=utf-8"

                }

            );

            res.end(

                "Página no encontrada"

            );

        }

    );

/* =========================================

   INICIAR SERVIDOR

========================================= */

servidor.listen(

    PORT,
'0.0.0.0',
    () => {

        console.log("");

        console.log(

            "===================================="

        );

        console.log(

            "       BANCO DEMO FUNCIONANDO"

        );

        console.log(

            "===================================="

        );

        console.log("");

        console.log(

            "Página:"

        );

        console.log(

            "http://localhost:3000"

        );

        console.log("");

        console.log(

            "Administrador:"

        );

        console.log(

            "http://localhost:3000/admin"

        );

        console.log("");

        console.log(

            "Encuestas:"

        );

        console.log(

            "encuestas-demo.json"

        );

        console.log("");

        console.log(

            "Comentarios:"

        );

        console.log(

            "comentarios-demo.json"

        );

        console.log("");

    }

);