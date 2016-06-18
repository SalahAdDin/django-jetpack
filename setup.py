import os
from setuptools import setup, find_packages


def read(fname):
    path = os.path.join(os.path.dirname(__file__), fname)
    try:
        file = open(path, encoding='utf-8')
    except TypeError:
        file = open(path)
    return file.read()


def get_install_requires():
    install_requires = ['Django']
    try:
        import importlib
    except ImportError:
        install_requires.append('importlib')
    return install_requires

setup(
    name='django-jetpack',
    version=__import__('jet').VERSION,
    description='Modern template for Django admin interface with improved functionality',
    long_description=read('README.rst'),
    author='Jens Astrup (+ Denis Kildishev)',
    author_email='jensaiden@gmail.com',
    url='https://gitlab.com/jensastrup/django-jetpack',
    packages=find_packages(),
    license='GPLv2',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Framework :: Django',
        'License :: Freely Distributable',
        'License :: OSI Approved :: GNU General Public License v2 (GPLv2)',
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.2',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Environment :: Web Environment',
        'Topic :: Software Development',
        'Topic :: Software Development :: User Interfaces',
    ],
    zip_safe=False,
    include_package_data=True,
    install_requires=get_install_requires(), requires=['django']
)
