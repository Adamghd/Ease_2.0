function encrypt(data) {

	var output = [];
	for (var i = 0; i < data.length; i++) {

		output.push(data.charCodeAt(i) + ',');

	}
	var string = output.join('');
	return string.slice(0, string.length - 1);

}

function decrypt(data) {

	var output = [];
	var array = data.split(',');
	for (var i = 0; i < array.length; i++) {

		output.push(String.fromCharCode(array[i]));

	}
	return output.join('');

}


var password = encrypt('f4xvnchs');
console.log(password);