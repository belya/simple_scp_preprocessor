PATH_TO_INTERPRETER="./jsdb"
PATH_TO_ESPRIMA="./sources/esprima.js"
PATH_TO_CORE="./sources/simplescp1_2.js"
PATH_TO_MODIFIERS="./sources/simplescp1_2_modifiers.js"
PATH_TO_OPERATORS="./sources/simplescp1_2_operators.js"
PATH_TO_PARSER="./sources/simplescp1_2_parser.js"
PATH_TO_BUFFER="./buffer"
PATH_TO_SSCP_FILES="../../ims.ostis.kb/"
SSCP_EXTENSION="*.sisp"
echo "Starting simplescp translator"
for file in $(find $PATH_TO_SSCP_FILES -name $SSCP_EXTENSION) 
do
  echo "preparing $file..."
  echo "print(consoleParse('$(echo $(cat $file))'));" > $PATH_TO_BUFFER
  $PATH_TO_INTERPRETER -load $PATH_TO_ESPRIMA -load $PATH_TO_CORE -load $PATH_TO_MODIFIERS -load $PATH_TO_OPERATORS -load $PATH_TO_PARSER $PATH_TO_BUFFER > "./$file.scs"
done
rm -f ./buffer
echo "Stopping simplescp translator"