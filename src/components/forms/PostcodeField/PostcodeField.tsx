import TextField, { TextFieldProps } from '../TextField/TextField';

const PostcodeField: React.FC<TextFieldProps> = ({ ...textFieldProps }) => {
  // Dutch postcode has 4 numbers and 2 letters (case insensitive). Letter combinations SS, SD and SA
  // are not used due to the Nazi-association.
  // See https://stackoverflow.com/a/17898538/7146757 and https://nl.wikipedia.org/wiki/Postcodes_in_Nederland
  const pattern = '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$';

  return (
    <TextField
      pattern={pattern}
      {...textFieldProps}
    />
  );
}

export default PostcodeField;
