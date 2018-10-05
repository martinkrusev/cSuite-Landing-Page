<?php

// Email address verification
function isEmail($email)
{
	return filter_var($email, FILTER_VALIDATE_EMAIL);
}

if ($_POST) {

	// Enter the email where you want to receive the message
	$emailFrom = 'noreply@iriana.io';
	$emailTo = 'info@intracol.com, kmazdrashki@intracol.com, vmaslenkov@intracol.com, kamenim@gmail.com';
	$mailParams = '-f' . $emailFrom;

	$firstName = addslashes(trim($_POST['fname']));
	$lastName = addslashes(trim($_POST['lname']));
	$company = addslashes(trim($_POST['company']));
	$clientEmail = addslashes(trim($_POST['email']));
	$phone = addslashes(trim($_POST['phone']));
	$message = addslashes(trim($_POST['message']));

	$array = array('firstNameMessage' => '', 'lastNameMessage' => '', 'companyMessage' => '', 'emailMessage' => '', 'phoneMessage' => '', 'messageMessage' => '');

	$isMailSent = false;

	// Data for the auto response email
	$respSubject = 'Thank you for choosing Iriana';
	$respMsg = '';

	if ($firstName == '') {
		$array['firstNameMessage'] = 'Empty first name!';
    }
	if ($lastName == '') {
		$array['lastNameMessage'] = 'Empty last name!';
	}
	if ($company == '') {
		$array['companyMessage'] = 'Empty company name!';
	}
	if (!isEmail($clientEmail)) {
		$array['emailMessage'] = 'Invalid email!';
	}
	if ($phone == '') {
		$array['phoneMessage'] = 'Empty phone number!';
	}
	if ($message == '') {
		$array['messageMessage'] = 'Empty message!';
	}
	if (isEmail($clientEmail) && $firstName != '' && $lastName != '' && $company != '' && $phone != '' && $message != '') {
		// Send email
		$headers = implode("\r\n", [
			"From: \"Iriana ContactUs Form\" <{$emailFrom}>",
			"Reply-To: " . $clientEmail,
			"MIME-Version: 1.0",
			"Content-type: text/plain; charset=utf-8"
		]);
		$message = "Name: ". $firstName . " " . $lastName . "\nPhone number: " . $phone . "\nCompany: " . $company . "\n" . $message;
		$isMailSent = mail($emailTo, "Iriana Contact form: $clientEmail", $message, $headers, $mailParams);
	}

	if ($isMailSent) {
		$headers = implode("\r\n", [
			"From: $emailFrom",
			"MIME-Version: 1.0",
			"Content-type: text/html; charset=utf-8"
		]);

		// Thank you message template
		$respMsg = emailTemplate();
		// Send thank you e-mail
		mail($clientEmail, $respSubject, $respMsg, $headers);
	}
	echo json_encode($array);

}

function emailTemplate()
{
	$scheme = $_SERVER['REQUEST_SCHEME'];
	$hrefBase = $scheme . '://' . $_SERVER['HTTP_HOST'];
	ob_start();
	?>
	<html>
	<body>
		<p>Hello,</p>
		<p>Thank you for your interest in our product Iriana. Our representative will contact you within the next 48
			hours.</p>
		<p>With Iriana you can reach hundreds of thousands of recipients with just a few mouse clicks. Our system can
			deliver voice and text messages to phone and mobile users, allowing recipients to provide input using their
			voice or keypad. With built-in multi-language speech recognition Iriana facilitates organizing and conducting
			complex outbound and poll campaigns and collecting user input using natural language in the form of a
			conversation.</p>
		<p>You can find information about our products family on our <a href="http://www.intracol.com/solutions">website</a>.
		</p>
		<img src="<?=$hrefBase?>/assets/img/mailTmpl.PNG" usemap="#image-map">
		<map name="image-map">
			<area target="" alt="Angelia" title="Angelia" href="http://www.intracol.com/solutions/angelia"
			      coords="191,71,63" shape="circle">
			<area target="" alt="Intracol" title="Intracol" href="http://www.intracol.com" coords="318,136,31"
			      shape="circle">
			<area target="" alt="Iriana" title="Iriana" href="https://iriana.io/" coords="438,59,51" shape="circle">
			<area target="" alt="Jabborate" title="Jabborate" href="http://www.jabborate.com/" coords="586,104,66"
			      shape="circle">
			<area target="" alt="Calidio" title="Calidio" href="http://www.intracol.com/solutions/calidio"
			      coords="458,213,51" shape="circle">
		</map>
		<p><img src="<?=$hrefBase?>/assets/img/logo.png"> team</p>
	</body>
	</html>
	<?php
	return ob_get_clean();
}
