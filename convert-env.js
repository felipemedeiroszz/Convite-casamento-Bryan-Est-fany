const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
  const content = fs.readFileSync(envPath, 'utf-8');
  const convertedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  fs.writeFileSync(envPath, convertedContent, 'utf-8');
  console.log('✓ Arquivo .env convertido para terminação Unix (LF)');
  console.log('✓ Variáveis de ambiente agora devem funcionar corretamente');
} catch (error) {
  console.error('Erro ao converter arquivo .env:', error);
  process.exit(1);
}
