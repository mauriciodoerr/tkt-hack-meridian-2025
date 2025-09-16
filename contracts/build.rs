use std::env;

fn main() {
    // Build script para gerar IDL automaticamente quando compilar
    println!("cargo:rerun-if-changed=src/lib.rs");

    // Se estivermos buildando para wasm32, não execute a geração de IDL
    if env::var("TARGET").unwrap_or_default().contains("wasm32") {
        return;
    }

    println!("🔄 Gerando IDL durante o build...");
}