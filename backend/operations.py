def calculate(a, operator, b):
    """Realiza operaciones aritméticas básicas."""
    try:
        a = float(a)
        b = float(b)
    except ValueError:
        raise ValueError("Operands must be numbers")

    if operator == "+":
        return a + b
    elif operator == "-":
        return a - b
    elif operator == "*":
        return a * b
    elif operator == "/":
        if b == 0:
            raise ZeroDivisionError("Division by zero is not allowed")
        return a / b
    else:
        raise ValueError(f"Unsupported operator: {operator}")
