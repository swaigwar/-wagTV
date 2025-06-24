#!/bin/zsh

# AI Safety Tools Installer
# This script installs the required AI safety tools using Homebrew

echo "🔒 Installing AI Safety Tools..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
  echo "❌ Homebrew is not installed. Please install Homebrew first:"
  echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  exit 1
fi

# Install Python if not already installed
if ! command -v python3 &> /dev/null; then
  echo "📦 Installing Python 3..."
  brew install python3
fi

# Ensure pip is available
if ! command -v pip3 &> /dev/null; then
  echo "❌ pip3 not found. Trying to reinstall Python..."
  brew reinstall python3
  
  if ! command -v pip3 &> /dev/null; then
    echo "❌ Failed to install pip3. Please install pip manually."
    exit 1
  fi
fi

# Install pipx for managing Python applications
echo "📦 Installing pipx..."
brew install pipx
pipx ensurepath

# Install Semgrep
echo "📦 Installing Semgrep..."
brew install semgrep

# Create a virtual environment for AI safety tools
echo "📦 Creating virtual environment for AI safety tools..."
VENV_DIR="$HOME/.venvs/ai-safety-tools"
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

# Install AI safety tools in the virtual environment
echo "📦 Installing AI safety tools in virtual environment..."
pip install llmscan promptinject modelguard

# Check if installations were successful
echo "\n✅ Installation status:"
echo "----------------------------"

# Check Semgrep
if command -v semgrep &> /dev/null; then
  echo "✅ Semgrep: Installed $(semgrep --version)"
else
  echo "❌ Semgrep: Not installed"
fi

# Check Python tools
echo "\n🐍 Python packages (in virtual environment):"
pip list | grep -E 'llmscan|promptinject|modelguard'

# Create a wrapper script for running AI tools
WRAPPER_DIR="$HOME/.local/bin"
mkdir -p "$WRAPPER_DIR"

echo "📦 Creating wrapper scripts for AI tools..."
for TOOL in llmscan promptinject modelguard; do
  if [ -f "$VENV_DIR/bin/$TOOL" ]; then
    cat > "$WRAPPER_DIR/$TOOL" << EOF
#!/bin/bash
source "$VENV_DIR/bin/activate"
$VENV_DIR/bin/$TOOL "\$@"
EOF
    chmod +x "$WRAPPER_DIR/$TOOL"
    echo "✅ Created wrapper for $TOOL"
  fi
done

# Add wrapper directory to PATH if not already there
if [[ ":$PATH:" != *":$WRAPPER_DIR:"* ]]; then
  echo "export PATH=\"\$PATH:$WRAPPER_DIR\"" >> "$HOME/.zshrc"
  echo "✅ Added $WRAPPER_DIR to PATH in .zshrc"
fi

echo "\n🚀 Installation complete!"
echo "AI safety tools installed in virtual environment: $VENV_DIR"
echo "Wrapper scripts created in: $WRAPPER_DIR"
echo "\nTo use the tools, either:"
echo "1. Run 'source $VENV_DIR/bin/activate' to activate the virtual environment"
echo "2. Or use the wrapper scripts (may require restarting your terminal)"
echo "\nYou can now run 'node scripts/security-scan.js' to check your project for AI safety issues."
