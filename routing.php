<?php
/**
 * Simple routing implementation with the help of simple .htaccess rules
 * @author kamen.mazdrashki
 * @date 2017-09-20
 */

$page = trim($_GET['page'], " \t\n\r\0\x0B\\/");
// if empty, default to index.html
if (strlen($page) == 0) {
	$page = 'index.html';
}

// try to include what has been passed
include_page_if_exists($page);
// try adding '.html'
include_page_if_exists($page.'.html');
// no luck so far, fallback to index.html
include_page_if_exists('index.html');

function include_page_if_exists($page)
{
	if (file_exists($page)) {
		include($page);
		die;
	}
}