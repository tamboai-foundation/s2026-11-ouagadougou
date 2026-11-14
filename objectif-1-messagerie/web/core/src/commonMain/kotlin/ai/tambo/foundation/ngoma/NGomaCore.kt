@file:OptIn(ExperimentalJsExport::class)

package ai.tambo.foundation.ngoma

import ai.tambo.foundation.ngoma.generated.registerAllTModels
import ai.tambo.foundation.ngoma.models.Note
import ai.tambo.tmodeler.ms.ext.filter
import ai.tambo.tmodeler.ms.ext.lazy
import ai.tambo.tmodeler.tmodelerInit
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

/**
 * Point d'entrée Kotlin/Wasm : seulement l'initialisation de TModeler et un exemple de modèle (Note).
 * Les ids transitent en nombres JS ; le contenu est renvoyé en JSON (String).
 */
object NGomaCore {
    // Incrémenter pour repartir d'une base vide dans tous les navigateurs.
    const val DB_VERSION = 1

    private var ready = false

    fun init(dbName: String): Boolean {
        if (ready) return true
        registerAllTModels()
        if (!tmodelerInit("$dbName-$DB_VERSION")) return false
        ready = true
        return true
    }

    fun createNote(title: String, content: String): Double {
        val note = Note()
        note.title_ = title
        note.content_ = content
        note.isave()
        return 1.0
    }

    fun noteCount(): Double = Note.tms.with(Note()).lazy().filter().coreBuild().size.toDouble()
}

@JsExport
@JsName("ngomaInit")
fun ngomaInit(dbName: String): Boolean = try {
    NGomaCore.init(dbName)
} catch (_: Throwable) {
    false
}

@JsExport
@JsName("ngomaCreateNote")
fun ngomaCreateNote(title: String, content: String): Double = NGomaCore.createNote(title, content)

@JsExport
@JsName("ngomaNoteCount")
fun ngomaNoteCount(): Double = NGomaCore.noteCount()
