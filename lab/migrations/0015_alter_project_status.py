# Generated by Django 4.0.1 on 2022-02-21 09:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0014_alter_objectgroup_options_object_collection_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='status',
            field=models.IntegerField(choices=[(1, 'To schedule'), (11, 'Scheduled'), (21, 'Ongoing'), (31, 'Finished')], default=1, verbose_name='Status'),
        ),
    ]
