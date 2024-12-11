//IM/2021/020 Karunathilaka M.A

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { evaluate, sqrt } from 'mathjs';

const App = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isResultFinal, setIsResultFinal] = useState(false);
  const [isError, setIsError] = useState(false);

  const btnPress = (value) => {
  
    // Prevent exceeding the digit limit
    if (!isNaN(value) && isExceedingDigitLimit()) {
      return; 
    }

    if (value === '( )') {
      const openCount = (input.match(/\(/g) || []).length;
      const closeCount = (input.match(/\)/g) || []).length;
  
      // Insert '(' or ')'
      if (openCount > closeCount && !['+', '-', 'x', '÷', '('].includes(input.slice(-1))) {
        setInput(input + ')');
      } else {
        setInput(input + '(');
      }
      return;
    }

    // If the result is final and the user enters a number, the input is reset
    if (isResultFinal && !isNaN(value)) {
      setInput(value);
      setResult('');
      setIsResultFinal(false);
      setIsError(false);
      return;
    }

    // Avoid entering these characters at the beginning
    if (!input && ['%', '÷', 'x', '+'].includes(value)) {
      return;
    }
  
    // Avoid entering these operants multiple times near each other
    if (['+', '-', 'x', '÷'].includes(value) && ['+', '-', 'x', '÷'].includes(input.slice(-1))) {
      return;
    }
  
    // Zero can not be entered before a digit
    if (input === '0' && !isNaN(value) && value !== '.') {
      setInput(value);
      return;
    }
  
    // Allow entering '0.' if the user inputs a decimal
    if (input === '0' && value === '.') {
      setInput('0.');
      return;
    }
  
    if (!isNaN(value)) {
      setInput(input + value);
      return;
    }
  
    if (value === '%') {
      if (input) {
        try {
          const percentage = evaluate(`${input}/100`);
          setResult(percentage.toString());
          setIsResultFinal(true);
          setInput('');
        } catch (error) {
          setResult('Error');
          setIsError(true);
        }
      }
      return;
    }
  
    if (value === 'C') {
      setInput('');
      setResult('');
      setIsResultFinal(false);
      setIsError(false);
      return;
    }
  
    if (value === 'DEL') {
      setInput(input.slice(0, -1));
      return;
    }
  
    if (value === '√') {
      if (input) {
        try {
          const number = evaluate(input);
          if (number >= 0) {
            const sqrtResult = sqrt(number).toString();
            if(sqrtResult.length > 8) {
              setResult(parseFloat(sqrtResult).toFixed(5).toString());
              setInput('');
              setIsResultFinal(true);
            } 
            else{
              setResult(sqrtResult);
              setInput('');
              setIsResultFinal(true);
            }            
          } 
          else {
            setResult('Negative Number');
            setIsError(true);
          }
        } 
        catch (error) {
          setResult('Error');
          setIsError(true);
        }
      }
      return;
    }
  
    if (value === '=') {
      if (isResultFinal) return;
      try {
        const removedZeroInput = removeZeroInput(input); 
        const formattedInput = removedZeroInput.replace(/÷/g, '/').replace(/x/g, '*');

        // Check for division by zero
        if (formattedInput.includes('/0') && !formattedInput.includes('/0.')) {
          setResult("Can't divide by 0");
          setIsError(true);
          return;
        }

        const calculatedResult = evaluate(formattedInput);
        setResult(parseFloat(calculatedResult.toFixed(5)).toString()); //answer limited to max 5 decimal places
        setInput('');
        setIsResultFinal(true);
      } catch (error) {
        setResult('Invalid input');
        setIsError(true);
      }
      return;
    }
  
    setInput(input + value);
    setIsResultFinal(false);
  };
  
  useEffect(() => {
    if (input) {
      try {
        const removedZeroInput = removeZeroInput(input); // removedZeroInput input
        const formattedInput = removedZeroInput.replace(/÷/g, '/').replace(/x/g, '*');

        if (isError) {
          setIsError(false);
        }

        if (formattedInput.includes('/0') && !formattedInput.includes('/0.')) {
          setResult("Can't divide by 0");
          setIsError(true);
          return;
        }

        if (formattedInput.includes('/0.')) {
          setResult('');
          return;
        }

        const liveResult = evaluate(formattedInput);
        setResult(parseFloat(liveResult.toFixed(5)).toString()); //live answer limited to max 5 decimal places
      } 
      catch (error) {
        setResult('');
      }
    } 
    else if (!isResultFinal && !isError) {
      setResult('');
    }
  }, [input]); 
  
  const isExceedingDigitLimit = () => {
    const parts = input.split(/[\+\-x÷]/); // Split input by operators
    const lastNumber = parts[parts.length - 1]; 
    return lastNumber.length >= 15; 
  };

  const calculateInputFontSize = () => {
    if (input.length > 11) return 34; 
    if (input.length > 7) return 48; 
    return 72;                        
  };

  const calculateResultFontSize = () => {
    if (isResultFinal && result.length <= 7) return 72;
    else if (isResultFinal && result.length >= 11) return 42;
    else if (isResultFinal && result.length > 7) return 64;    
    else if (input.length > 11) return 24; 
    else if (input.length > 7) return 32; 
    return 40;                        
  };

  const Hr = () => {
    return <View style={styles.hr} />;
  };

  const removeZeroInput = (input) => {
    // Replace numbers with leading zeros (e.g., "03" => "3")
    return input.replace(/(\D|^)0+(\d+)/g, "$1$2");
  };

  return (
    <View style={styles.container}>
      {/* Display Section */}
      <View style={styles.display}>
        <Text style={[styles.inputText, {fontSize: calculateInputFontSize()} ]}>
          {input}
        </Text>
        <Text style={[styles.resultText, isResultFinal && styles.resultTextFinal, isError && styles.errorText, {fontSize: calculateResultFontSize()} ]}>
          {result}
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <TouchableOpacity>
          <Icon name="backspace" size={32} color="black" onPress={() => btnPress('DEL')}/>
        </TouchableOpacity>       
      </View>

      <View>
          <Hr/>        
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        {/* First Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('C')}>
            <Text style={styles.buttonText}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('√')}>
            <Text style={styles.buttonText}>√</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('%')}>
            <Text style={styles.buttonText}>%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('÷')}>
            <Text style={styles.buttonText}>÷</Text>
          </TouchableOpacity>
        </View>

        {/* Second Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('7')}>
            <Text style={styles.buttonTextBlue}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('8')}>
            <Text style={styles.buttonTextBlue}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('9')}>
            <Text style={styles.buttonTextBlue}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('x')}>
            <Text style={styles.buttonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Third Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('4')}>
            <Text style={styles.buttonTextBlue}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('5')}>
            <Text style={styles.buttonTextBlue}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('6')}>
            <Text style={styles.buttonTextBlue}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('-')}>
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>
        </View>

        {/* Fourth Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('1')}>
            <Text style={styles.buttonTextBlue}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('2')}>
            <Text style={styles.buttonTextBlue}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('3')}>
            <Text style={styles.buttonTextBlue}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => btnPress('+')}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Fifth Row */}
        <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => btnPress('.')}>
            <Text style={styles.buttonText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button]} onPress={() => btnPress('0')}>
            <Text style={styles.buttonTextBlue}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={() => btnPress('( )')}>( )</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonEqual} onPress={() => btnPress('=')}>
            <Text style={styles.buttonTextEqual}>=</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    justifyContent: "center",
    marginBottom:10,
  },
  display: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#f1F1f1',
    borderRadius: 20,
    margin: 5,
    marginBottom: 5,
    marginTop: 35,
  },
  iconContainer: {
    alignItems: 'flex-end',
    marginRight: 5,
  },
  inputText: {
    fontSize: 72, 
    color: '#333',
  },
  resultText: {
    fontSize: 40, 
    color: '#000',
    fontWeight: 'bold',
  },
  resultTextFinal: {
    fontSize: 72,
    color: '#1D24CA',
    marginBottom: 50,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonEqual: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    backgroundColor: "#1D24CA", 
  },
  buttonText: {
    fontSize: 24,
    color: "black",
  },
  buttonTextEqual: {
    fontSize: 24,
    color: "#fff",
  },
  buttonTextBlue: {
    fontSize: 24,
    color: "#1D24CA", 
  },
  hr: {
    height: 1, 
    backgroundColor: 'black', 
    width: '100%', 
    marginVertical: 10, 
  },
  errorText: {
    color: '#1D24CA'
  },
});

export default App;