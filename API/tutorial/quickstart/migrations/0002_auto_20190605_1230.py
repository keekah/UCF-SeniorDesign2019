# Generated by Django 2.2 on 2019-06-05 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quickstart', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='name',
            new_name='ProjectName',
        ),
        migrations.RenameField(
            model_name='project',
            old_name='sponsor',
            new_name='Sponsor',
        ),
        migrations.RenameField(
            model_name='project',
            old_name='term',
            new_name='Term',
        ),
        migrations.RenameField(
            model_name='project',
            old_name='year',
            new_name='Year',
        ),
        migrations.AddField(
            model_name='project',
            name='Sponsor2',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]