const languageOperatorsNames = [
  "search",
  "sys_search",
  "generate",
  "sys_generate",
  "erase",
  "print",
  "var_assign",
  "cont_assign",
  "add",
  "subtract",
  "multiple",
  "divide",
  "cos",
  "sin",
  "acos",
  "asin",
  "greater",
  "equals",
  "is", 
  "show",
  "has_value",
  "stringIfEq",
  "stringIfGr",
  "stringSplit",
  "stringLen",
  "stringSub",
  "stringSlice",
  "stringStartsWith",
  "stringEndsWith",
  "stringReplace",
  "stringToUpperCase",
  "stringToLowerCase",
  "call",
  "wait",
  "delete_value",
]
const languageOperators = {
  "search1":SearchElOperator,
  "search3":SearchElStr3Operator,
  "sys_search4":SysSearchOperator,
  "search5":SearchElStr5Operator,
  "search2":SearchSetOperator,
  "search6":SearchSetStr3Operator,
  "search10":SearchSetStr5Operator,
  "generate1":GenElOperator,
  "generate3":GenElStr3Operator,
  "sys_generate4":SysGenerateOperator,
  "generate5":GenElStr5Operator,
  //"generate2":GenSetOperator,
  "generate6":GenSetStr3Operator,
  "generate10":GenSetStr5Operator,
  "erase1":EraseElOperator,
  "erase3":EraseElStr3Operator,
  "erase5":EraseElStr5Operator,
  "erase2":EraseSetOperator,
  "erase6":EraseSetStr3Operator,
  "erase10":EraseSetStr5Operator,
  "print1":PrintOperator,
  "var_assign2":VarAssignOperator,
  "cont_assign2":ContAssignOperator,
  "add3":ContAddOperator,
  "subtract3":ContSubtractOperator,
  "multiple3":ContMultipleOperator,
  "divide3":ContDivideOperator,
  "cos2":ContCosOperator,
  "sin2":ContSinOperator,
  "acos2":ContArccosOperator,
  "asin2":ContArcsinOperator,
  "greater2":IfGreaterOperator,
  "show1":PrintElOperator,
  "is2":IfCoinOperator,
  "equals2":IfEqOperator,
  "has_value1":IfVarAssignOperator,
  "stringIfEq2": StringIfEqOperator,
  "stringIfGr2": StringIfGrOperator,
  "stringSplit3": StringSplitOperator,
  "stringLen2": StringLenOperator,
  "stringSub3": StringSubOperator,
  "stringSlice4": StringSliceOperator,
  "stringStartsWith2": StringStartsWithOperator,
  "stringEndsWith2": StringEndsWithOperator,
  "stringReplace4": StringReplaceOperator,
  "stringToUpperCase2": StringToUpperCaseOperator,
  "stringToLowerCase2": StringToLowerCaseOperator,
  "call3": CallOperator,
  "wait1": WaitReturnOperator, 
  "delete_value1": VarEraseOperator,
}
const modifiersNames = [
  "fixed",
  "assign",
  "pos_const_perm",
  "arc",
  "node",
  "erase",
  "scp_variable",
  "scp_constant",
  "constant",
  "common",
  "link",
]
const modifiers = {
  "fixed":FixedArgument,
  "assign":AssignArgument,
  "pos_const_perm":PosConstPermArgument,
  "arc":ArcArgument,
  "node":NodeArgument,
  "erase":EraseArgument,
  "scp_variable":ScpVarArgument,
  "scp_constant":ScpConstArgument,
  "common":CommonArgument,
  "constant":ConstArgument,
  "link":LinkArgument,
}

function parse(code) {
  SCSCode = getSCSCode(code);
  syntax = esprima.parse(code);
  return format(design(parseFunction(syntax.body[0]).toString() + SCSCode));
}

function consoleParse(code) {
  SCSCode = getSCSCode(code);
  syntax = esprima.parse(code);
  return formatConsole(design(parseFunction(syntax.body[0]).toString() + SCSCode));
}

function getSCSCode(code) {
  allSCS = code.split(/(\/\*scs)|(scs\*\/)/g);
  SCSCode = "";
  for(var i = 0; i < allSCS.length; i++) {
    if (i % 2 != 0 && allSCS[i] != "/*scs" && allSCS[i] != "scs*/") 
      SCSCode += "<br>" + allSCS[i];
  }
  return SCSCode;
}

function format(string) {
  return string.split(' ').join('&nbsp;');
}

function formatConsole(string) {
  return string.split('<br>').join('\n');
}

function design(string) {
  spaces = 0;
  index = string.search("<br>");
  designedString = "";
  while(index != -1) {
    line = string.substr(0, index + 4);
    string = string.substr(index + 4);
    if (line.search("\\*\\)") != -1) spaces -= 4;
    for(i = 0; i < spaces; i++)
      designedString += " ";
    designedString += line;
    if (line.search("\\(\\*") != -1) spaces += 4;
    index = string.search("<br>");
  }
  designedString += string;
  return designedString;
}

function parseFunction(syntax) {
  var parameters = [];
  for(var i = 0; i < syntax.params.length; i++) { 
    parameters.push(parseInParameter(i + 1, syntax.params[i]));
  }
  searchParameters(syntax.body.body, parameters);
  var operators = parseBlockStatement(syntax.body);
  var returnOperator = new ReturnOperator();
  operators.addTransition(new GotoTransition(returnOperator));
  return new Program(syntax.id.name, parameters, [operators, returnOperator]);
}

function searchParameters(body, parameters) {
  for(var i = 0; i < body.length; i++) {
    if (body[i].type == "ReturnStatement")
      parameters.push(parseOutParameter(parameters.length + 1, body[i].argument));
    else break;
  }
}

function parseInParameter(number, parameter) {
  return new NumberArgument(number, new InArgument(new SimpleArgument(parameter.name)));
}

function parseOutParameter(number, parameter) {
  return new NumberArgument(number, new OutArgument(new SimpleArgument(parameter.name)));
}

function parseStatement(statement) {
  if (statement == null) return new EmptyOperator();
  switch(statement.type) {
    case "ExpressionStatement":
      return parseExpressionStatement(statement.expression);
    case "BlockStatement":
      return parseBlockStatement(statement);
    case "CallExpression":
      return parseCallExpression(statement);
    case "IfStatement":
      return parseIfStatement(statement);
    case "Identifier":
      return parseIfVarAssignExpression(statement);
    case "WhileStatement":
      return parseWhileStatement(statement);
    case "ForInStatement":
      return parseForInStatement(statement);
    default:
      return new EmptyOperator();
  }
}

function parseIfStatement(statement) {
  var test = parseStatement(statement.test);
  var consequent = parseStatement(statement.consequent);
  var alternate = parseStatement(statement.alternate);
  return new IfOperator(test, consequent, alternate);
}

function parseWhileStatement(statement) {
  var test = parseStatement(statement.test);
  var body = parseStatement(statement.body);
  return new WhileOperator(test, body);
}

function parseForInStatement(statement) {
  var left = parseArgument(statement.left);
  var right = parseArgument(statement.right);
  var body = parseStatement(statement.body);  
  return new ForInStatement(left, right, body);
} 

function parseExpressionStatement(expression) {
  switch(expression.type) {
    case "CallExpression":
      return parseCallExpression(expression);
    case "Identifier":
      return parseIfVarAssignExpression(expression);
    //case "BinaryExpression":
      //return parseBinaryExpression(expression);
  }
}

/*function parseBinaryExpression(expression) {
  switch(expression.operator) {
    case "==":
      return parseEqualExpression(expression);
  }
}

function parseEqualExpression(expression) {
  var arguments = [expression.left, expression.right];
  var useNumberComparing = (typeof expression.left == 'number' && expression.right )
}*/

function parseIfVarAssignExpression(expression) {
  return new IfVarAssignOperator([processArgument(preprocessArgument([expression.name]))]);
}

function parseBlockStatement(block) {
  var operators = [];
  var body = block.body;
  for(var i = 0; i < body.length; i++) {
    var operator = parseStatement(body[i]);
    //TODO add this block to blockoperator
    if (operator && operators.length != 0) operators[operators.length - 1].addTransition(new GotoTransition(operator));
    operators.push(operator);
  }
  return new BlockOperator(operators);
}

function parseCallExpression(expression) {
  if (isLanguageOperator(expression.callee.name)) {
    return parseLanguageOperator(expression);
  }
  else {
    return parseUserFunction(expression);
  }
}

function parseLanguageOperator(languageOperator) {
  var name = languageOperator.callee.name + languageOperator.arguments.length;
  var arguments = parseArguments(languageOperator.arguments);
  return new languageOperators[name](arguments);
}

function parseUserFunction(expression) {
  var name = processArgument(preprocessArgument([expression.callee.name]));
  var callArguments = parseArguments(expression.arguments);
  return new CallUserFunctionOperator(name, callArguments);
}

function parseArguments(argumentArray) {
  var arguments = [];
  for(var i = 0; i < argumentArray.length; i++) {
    var argument = argumentArray[i];
    var temporaryArgument = parseArgument(argument);
    arguments.push(temporaryArgument);
  }
  return arguments;
}

//TODO split this on two functions
function convertArgument(argument) {
  var preprocessedArgument = [];
  if (argument.elements) {
    argument = argument.elements;
    for(var i = 0; i < argument.length; i++) {
      pushPartOfArgument(argument[i], preprocessedArgument);
    }
  }
  else 
    pushPartOfArgument(argument, preprocessedArgument);
  return preprocessedArgument;
}

function pushPartOfArgument(part, argument) {
  if(part.type == "Identifier")
    argument.push(part.name);
  else
    argument.push("[" + part.value + "]");
}

function preprocessArgument(argument) {
  if (argument.length == 0) return [];
  var preprocessedArgument = argument;
  argumentName = preprocessedArgument[preprocessedArgument.length - 1];
  if (preprocessedArgument.indexOf("scp_constant") == -1 && preprocessedArgument.indexOf("scp_variable") == -1) {
    if (isVariable(argumentName)) preprocessedArgument.unshift("scp_variable");
    else preprocessedArgument.unshift("scp_constant");
  }
  if (preprocessedArgument.indexOf("fixed") == -1 && preprocessedArgument.indexOf("assign") == -1)
        preprocessedArgument.unshift("fixed");
  return preprocessedArgument;
}

function processArgument(argument) {
  if (argument.length == 0) return undefined;
  var argumentObject;
  for(var i = argument.length - 1; i >=  0; i--) {
    var element = argument[i]; 
    if ((i != argument.length - 1) && isModifier(element)) 
      argumentObject = new modifiers[element](argumentObject);
    else 
      argumentObject = new SimpleArgument(element);
  }
  return argumentObject;
}

function parseArgument(argument) {
  return processArgument(preprocessArgument(convertArgument(argument)));
}

function isLanguageOperator(languageOperator) {
  return (languageOperatorsNames.indexOf(languageOperator) != -1)
}

function isModifier(modifier) {
  return (modifiersNames.indexOf(modifier) != -1) 
}

function isVariable(name) {
  return (name[0] == "_");
}

function isLiteral(name) {
  return (name[0] == "[");
}