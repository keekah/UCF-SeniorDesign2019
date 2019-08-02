# Generated by Django 2.2 on 2019-06-13 17:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quickstart', '0002_auto_20190605_1230'),
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('firstName', models.CharField(max_length=100)),
                ('lastName', models.CharField(max_length=100)),
                ('knightsEmail', models.CharField(max_length=100)),
                ('term', models.CharField(blank=True, max_length=100)),
                ('UCFID', models.IntegerField(blank=True)),
                ('overallGPA', models.FloatField(blank=True)),
                ('majorGPA', models.FloatField(blank=True)),
                ('intrestArea', models.TextField(blank=True)),
                ('technicalSkills', models.TextField(blank=True)),
                ('knownLanguages', models.TextField(blank=True)),
                ('workExperience', models.TextField(blank=True)),
                ('resumeLink', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='StudentProjectRanking',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('StudentID', models.IntegerField()),
                ('ProjectID', models.IntegerField()),
                ('Ranking', models.IntegerField()),
            ],
        ),
    ]