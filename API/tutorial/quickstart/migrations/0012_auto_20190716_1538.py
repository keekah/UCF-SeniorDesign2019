# Generated by Django 2.2 on 2019-07-16 19:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quickstart', '0011_student_authid'),
    ]

    operations = [
        migrations.RenameField(
            model_name='student',
            old_name='AuthID',
            new_name='authID',
        ),
        migrations.AddField(
            model_name='student',
            name='year',
            field=models.CharField(default=2019, max_length=4),
            preserve_default=False,
        ),
    ]
