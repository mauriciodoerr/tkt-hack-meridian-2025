# Makefile para otimização do contrato Soroban

.PHONY: build test optimize clean install-deps check-size

# Build normal
build:
	@echo "🔨 Building contract..."
	cargo build --target wasm32-unknown-unknown --release

# Run tests
test:
	@echo "🧪 Running tests..."
	cargo test

# Build otimizado
optimize: build
	@echo "🚀 Optimizing WASM..."
	@./optimize.sh

# Verificar tamanho dos arquivos
check-size:
	@echo "📊 WASM file sizes:"
	@ls -lh target/wasm32-unknown-unknown/release/*.wasm 2>/dev/null || echo "No WASM files found. Run 'make build' first."

# Instalar dependências para otimização
install-deps:
	@echo "📦 Installing optimization dependencies..."
	@command -v wasm-opt >/dev/null 2>&1 || { echo "Installing binaryen (wasm-opt)..."; brew install binaryen; }
	@rustup target add wasm32-unknown-unknown

# Limpar arquivos de build
clean:
	@echo "🧹 Cleaning build artifacts..."
	cargo clean

# Build completo com otimização
release: clean test optimize check-size
	@echo "✅ Release build complete!"

# Deploy para Soroban (exemplo)
deploy: optimize
	@echo "🚀 Deploying optimized contract..."
	@echo "Use: soroban contract deploy --wasm target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm --source account --network testnet"

# Verificar se as dependências estão instaladas
deps-check:
	@command -v wasm-opt >/dev/null 2>&1 || { echo "❌ wasm-opt not found. Run 'make install-deps'"; exit 1; }
	@rustup target list --installed | grep -q wasm32-unknown-unknown || { echo "❌ wasm32-unknown-unknown target not found. Run 'make install-deps'"; exit 1; }
	@echo "✅ All dependencies are installed"