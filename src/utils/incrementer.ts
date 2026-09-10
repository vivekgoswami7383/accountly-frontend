const incrementer = (string: any) => {
  const str = string.toString();

  let number = str.match(/\d+/) === null ? 0 : str.match(/\d+/)[0];

  const numberLength = number.length;

  number = (parseInt(number) + 1).toString();

  while (number.length < numberLength) {
    number = '0' + number;
  }

  return str.replace(/[0-9]/g, '').concat(number);
};

export default incrementer;
