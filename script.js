(function(){
  const display = document.getElementById('display');
  const keys = document.querySelectorAll('.key');

  let expression = '';

  function updateDisplay(text){
    display.textContent = text === '' ? '0' : text;
  }

  function lastChar(){
    return expression.slice(-1);
  }

  function isOperator(ch){
    return ['+','-','×','÷','*','/'].includes(ch);
  }

  function lastNumberContainsDot(){
    // find substring after last operator/parenthesis
    const parts = expression.split(/[\+\-\×\÷\*\/\(\)]/);
    const last = parts[parts.length - 1];
    return last.includes('.');
  }

  function appendValue(val){
    if (val === '.'){ 
      if (lastNumberContainsDot()) return;
      if (expression === '' || isOperator(lastChar()) || lastChar() === '('){
        // start a decimal number like "0."
        expression += '0.';
        updateDisplay(expression);
        return;
      }
    }

    // prevent two operators in a row (except allowing negative numbers)
    if (isOperator(val)){ 
      if (expression === '' && val !== '-') return; // only allow leading minus
      if (isOperator(lastChar())){
        // replace previous operator with new one
        expression = expression.slice(0, -1) + val;
        updateDisplay(expression);
        return;
      }
    }

    expression += val;
    updateDisplay(expression);
  }

  function clearAll(){
    expression = '';
    updateDisplay(expression);
  }

  function deleteLast(){
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }

  function sanitizeExpression(expr){
    // replace display operators with JS operators
    let s = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    // Remove any characters not allowed (digits, operators, parentheses, dot, spaces)
    if (!/^[0-9+\-*/().\s]+$/.test(s)) throw new Error('Invalid characters in expression');
    return s;
  }

  function evaluate(){
    if (expression === '') return;
    try {
      const s = sanitizeExpression(expression);
      // Use Function to evaluate; since we sanitized allowed chars only, this is acceptable here.
      // For production, consider a proper parser.
      const result = Function('"use strict"; return (' + s + ')')();
      expression = String(result);
      updateDisplay(expression);
    } catch (err){
      updateDisplay('Error');
      expression = '';
      console.error(err);
    }
  }

  keys.forEach(key => {
    key.addEventListener('click', () => {
      const value = key.getAttribute('data-value');
      const action = key.getAttribute('data-action');

      if (action === 'clear'){ clearAll(); return; }
      if (action === 'delete'){ deleteLast(); return; }
      if (action === 'equals'){ evaluate(); return; }

      if (value) appendValue(value);
    });
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;

    if ((/^[0-9]$/).test(key)) { appendValue(key); e.preventDefault(); return; }
    if (key === '.') { appendValue('.'); e.preventDefault(); return; }
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      // map * / to × ÷ for internal representation consistency (but not necessary)
      const map = {'*':'×','/':'÷'};
      appendValue(map[key] || key);
      e.preventDefault(); return;
    }
    if (key === 'Enter' || key === '=') { evaluate(); e.preventDefault(); return; }
    if (key === 'Backspace') { deleteLast(); e.preventDefault(); return; }
    if (key === 'Escape' || key.toLowerCase() === 'c') { clearAll(); e.preventDefault(); return; }
    if (key === '(' || key === ')') { appendValue(key); e.preventDefault(); return; }
  });

  // initialize
  updateDisplay('');
})();