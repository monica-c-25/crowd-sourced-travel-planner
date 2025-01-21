# from flask import Blueprint

# Import individual blueprints
from .experience import exp_bp

# List of all blueprints for easy registration
blueprints = [
    exp_bp,
]


def register_blueprints(app):
    """
    Register all blueprints to the Flask app.

    Args:
        app (Flask): The Flask application instance.
    """
    for bp in blueprints:
        app.register_blueprint(bp)
