# Generated by Django 2.2 on 2019-07-15 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quickstart', '0010_schedulestudent_rank'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='AuthID',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
