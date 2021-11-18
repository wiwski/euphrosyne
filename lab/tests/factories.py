import factory
import factory.fuzzy
from django.contrib.auth import get_user_model

from ..models import Participation, Project, Run


class StaffUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.LazyAttribute(
        lambda u: "{}.{}@example.com".format(u.first_name, u.last_name).lower()
    )
    password = factory.Faker("password")
    is_staff = True


class LabAdminUserFactory(StaffUserFactory):
    is_lab_admin = True


class ParticipationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Participation

    user = factory.SubFactory(StaffUserFactory)
    project = factory.SubFactory("lab.tests.factories.ProjectFactory")


class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project

    name = factory.Faker("name")


class ProjectWithLeaderFactory(ProjectFactory):
    leader_participation = factory.RelatedFactory(
        ParticipationFactory, factory_related_name="project", is_leader=True
    )


class RunFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Run

    label = factory.Faker("name")
    project = factory.SubFactory(ProjectFactory)
    energy_in_keV = factory.fuzzy.FuzzyInteger(0, high=10000, step=500)
    particle_type = factory.fuzzy.FuzzyChoice(Run.ParticleType)
