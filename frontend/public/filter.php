<html>
<body>

Zip File ID chose is  <?php echo $_POST["zipfile"]; ?><br>

<?php
$coursesCheckbox = $_POST['courses'];
if(empty($coursesCheckbox))
{
	echo("You didn't select any courses columns.");
}
else
{
	$N = count($coursesCheckbox);

	echo("You selected $N door(s): ");
	for($i=0; $i < $N; $i++)
	{
		echo($coursesCheckbox[$i] . " ");
	}
}
?>

Order by: <?php echo $_POST["coursesOrder"]; ?>
Sequence: <?php echo $_POST["sequence"]; ?>

</body>
</html>
