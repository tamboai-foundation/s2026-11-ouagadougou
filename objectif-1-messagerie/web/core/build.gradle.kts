plugins {
    kotlin("multiplatform") version "1.9.23"
    id("com.google.devtools.ksp") version "1.9.23-1.0.20"
}

kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-receivers")
    }

    wasmJs {
        binaries.library()
        browser()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("co.tamboai:TModeler:1.0.1")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
            }
        }
    }
}

// Registre des modèles TModeler généré à la compilation.
ksp {
    arg("tmodeler.registryPackage", "ai.tambo.foundation.ngoma.generated")
}

dependencies {
    add("kspWasmJs", "co.tamboai:tmodeler-ksp:1.0.1")
}

repositories {
    google()
    mavenCentral()
}
