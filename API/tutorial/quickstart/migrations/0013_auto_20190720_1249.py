# Generated by Django 2.2 on 2019-07-20 16:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quickstart', '0012_auto_20190716_1538'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='Max',
            field=models.IntegerField(default=5),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='Min',
            field=models.IntegerField(default=3),
            preserve_default=False,
        ),
    ]
