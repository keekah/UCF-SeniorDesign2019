# Generated by Django 2.2 on 2019-07-02 17:59

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('quickstart', '0008_auto_20190702_1337'),
    ]

    operations = [
        migrations.AlterField(
            model_name='schedule',
            name='DateCreated',
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]
