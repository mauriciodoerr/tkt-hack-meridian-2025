#!/bin/bash

# Script para gerar IDL do contrato Soroban

echo "🔧 Gerando IDL do contrato..."

# Build do contrato primeiro
echo "📦 Building contract..."
cargo build --target wasm32-unknown-unknown --release

WASM_FILE="target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM file not found. Build failed."
    exit 1
fi

echo "✅ WASM file found: $WASM_FILE"

# Verificar se soroban CLI está disponível
if command -v soroban &> /dev/null; then
    echo "🚀 Generating IDL with Soroban CLI..."

    # Gerar bindings TypeScript
    soroban contract bindings typescript \
        --wasm "$WASM_FILE" \
        --output-dir ./bindings \
        --overwrite

    echo "✅ TypeScript bindings generated in ./bindings/"

    # Tentar gerar schema JSON se disponível
    if soroban contract inspect --help | grep -q "schema"; then
        soroban contract inspect --wasm "$WASM_FILE" --schema > payment_with_fee_optimized.schema.json
        echo "✅ Schema JSON generated: payment_with_fee.schema.json"
    fi

else
    echo "⚠️  Soroban CLI not found. Installing..."

    # Tentar instalar soroban-cli
    if cargo install --list | grep -q "soroban-cli"; then
        echo "✅ Soroban CLI already installed"
    else
        echo "📦 Installing Soroban CLI..."
        cargo install --quiet soroban-cli --locked

        if [ $? -eq 0 ]; then
            echo "✅ Soroban CLI installed successfully"

            # Gerar bindings agora
            soroban contract bindings typescript \
                --wasm "$WASM_FILE" \
                --output-dir ./bindings \
                --overwrite

            echo "✅ TypeScript bindings generated in ./bindings/"
        else
            echo "❌ Failed to install Soroban CLI"
            echo "🔄 Using fallback IDL generation..."

            # Usar o gerador manual como fallback
            if [ -f "generate_idl" ]; then
                ./generate_idl
            else
                rustc generate_idl.rs && ./generate_idl
            fi
        fi
    fi
fi

echo "📋 Available IDL files:"
ls -la *.json *.idl 2>/dev/null | head -10 || echo "No IDL files found"
ls -la bindings/ 2>/dev/null | head -10 || echo "No bindings directory found"

echo "✅ IDL generation complete!"