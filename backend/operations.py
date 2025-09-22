def calculate(a, operator, b):
    try:
        a = float(a)
        b = float(b)

        if operator == "+":
            return a + b
        elif operator == "-":
            return a - b
        elif operator == "*":
            return a * b
        elif operator == "/":
            if b == 0:
                return "Error: división por cero"
            return a / b
        else:
            return "Operador no válido"
    except Exception as e:
        return f"Error: {str(e)}"
