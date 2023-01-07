import pygame as pg
from random import randint


SCREEN_WIDTH = 800
SCREEN_LENGTH = 800
FPS = 60

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (125, 125, 125)
LIGHT_BLUE = (64, 128, 255)
GREEN = (0, 200, 64)
YELLOW = (225, 225, 0)
PINK = (230, 50, 230)
ORANGE = (255, 150, 100)
COLORS = [WHITE, BLACK, GRAY, LIGHT_BLUE, GREEN, YELLOW, PINK, ORANGE]

pg.init()
screen = pg.display.set_mode((SCREEN_WIDTH, SCREEN_LENGTH))
clock = pg.time.Clock()
input_keys = {'quit': False, 'x_axis_motion': 0, 'y_axis_motion': 0}


def processing_keys(event):
    """Processing inputed keys for shorten main cycle."""
    for iteration in event:
        if iteration.type == pg.QUIT:
            input_keys['quit'] = True
        if iteration.type == pg.KEYDOWN:
            if iteration.key == pg.K_LEFT:
                input_keys['x_axis_motion'] -= 1
            if iteration.key == pg.K_RIGHT:
                input_keys['x_axis_motion'] += 1
            if iteration.key == pg.K_UP:
                input_keys['y_axis_motion'] += 1
            if iteration.key == pg.K_DOWN:
                input_keys['y_axis_motion'] -= 1
        elif iteration.type == pg.KEYUP:
            if iteration.key == pg.K_LEFT:
                input_keys['x_axis_motion'] += 1
            if iteration.key == pg.K_RIGHT:
                input_keys['x_axis_motion'] -= 1
            if iteration.key == pg.K_UP:
                input_keys['y_axis_motion'] -= 1
            if iteration.key == pg.K_DOWN:
                input_keys['y_axis_motion'] += 1


def draw_circle(color=WHITE, input_coord_x=SCREEN_WIDTH//2, input_coord_y=SCREEN_LENGTH//2, radius=30):
    """Drawing circle"""
    pg.draw.circle(screen, color, (input_coord_x, input_coord_y), radius)


def create_object(input_request='circle', input_coord_x=SCREEN_WIDTH//2, input_coord_y=SCREEN_LENGTH//2):
    """Drawing object of chosen shape"""
    if input_request == 'circle':
        return draw_circle(ORANGE, input_coord_x, input_coord_y)
    else:
        return draw_circle(ORANGE, input_coord_x, input_coord_y)


class Object:
    def __init__(self, shape='circle', name='Obj!', input_color=COLORS[randint(0, len(COLORS) - 1)]):
        self.name = name
        self.shape = shape
        self.inner_speed_x = randint(-15, 15)
        self.inner_speed_y = randint(-15, 15)
        self.gravity_factor = 0.05
        self.inertia_factor = 0.5
        self.inner_movement_data = [None, None, self.inner_speed_x, self.inner_speed_y]
        self.borders = [0, 0, 0, 0]
        self.location_screen = screen
        self.input_color = COLORS[randint(0, len(COLORS) - 1)]

    def linear_move(self, location_screen=screen,
                    input_coord_x=SCREEN_WIDTH//2, input_coord_y=SCREEN_LENGTH//2):
        """Locate object on screen with linear moving (with static speed)"""
        self.location_screen = location_screen
        self.inner_movement_data[0] = input_coord_x if self.inner_movement_data[0] is None else self.inner_movement_data[0]
        self.inner_movement_data[1] = input_coord_y if self.inner_movement_data[1] is None else self.inner_movement_data[1]

        if self.borders[0] <= 0:
            self.inner_movement_data[2] *= -1  # Speed X
            self.inner_movement_data[0] += 2  # Coord X

        if self.borders[1] >= SCREEN_WIDTH:
            self.inner_movement_data[2] *= -1  # Speed X
            self.inner_movement_data[0] -= 2  # Coord X

        if self.borders[2] <= 0:
            self.inner_movement_data[3] *= -1  # Speed Y
            self.inner_movement_data[1] += 2  # Coord Y

        if self.borders[3] >= SCREEN_LENGTH:
            self.inner_movement_data[3] *= -1  # Speed Y
            self.inner_movement_data[1] -= 2  # Coord Y

        self.inner_movement_data[0] += self.inner_movement_data[2]
        self.inner_movement_data[1] += self.inner_movement_data[3]

        if self.shape == 'circle':
            inner_radius = 10
            pg.draw.circle(self.location_screen, self.input_color,
                           (self.inner_movement_data[0], self.inner_movement_data[1]), inner_radius)
            self.borders[0] = self.inner_movement_data[0] - inner_radius
            self.borders[1] = self.inner_movement_data[0] + inner_radius
            self.borders[2] = self.inner_movement_data[1] - inner_radius
            self.borders[3] = self.inner_movement_data[1] + inner_radius

    def inertional_move(self, location_screen=screen,
                        input_coord_x=SCREEN_WIDTH//2, input_coord_y=SCREEN_LENGTH//2):
        """Locate object on screen with inertional moving (with slowing down)"""
        self.location_screen = location_screen
        self.inner_movement_data[0] = input_coord_x if self.inner_movement_data[0] is None else self.inner_movement_data[0]
        self.inner_movement_data[1] = input_coord_y if self.inner_movement_data[1] is None else self.inner_movement_data[1]

        if self.borders[0] <= 0:
            self.inner_movement_data[2] *= -1  # Speed X
            self.inner_movement_data[0] += 2  # Coord X

        if self.borders[1] >= SCREEN_WIDTH:
            self.inner_movement_data[2] *= -1  # Speed X
            self.inner_movement_data[0] -= 2  # Coord X

        if self.borders[2] <= 0:
            self.inner_movement_data[3] *= -1  # Speed Y
            self.inner_movement_data[1] += 2  # Coord Y

        if self.borders[3] >= SCREEN_LENGTH:
            self.inner_movement_data[3] *= -1  # Speed Y
            self.inner_movement_data[1] -= 2  # Coord Y

        self.inner_movement_data[0] += self.inner_movement_data[2]
        self.inner_movement_data[1] += self.inner_movement_data[3]

        if self.inner_movement_data[2] != 0:
            if self.inner_movement_data[2] > 0:
                self.inner_movement_data[2] = round((self.inner_movement_data[2] - self.inertia_factor), 2)
            else:
                self.inner_movement_data[2] = round((self.inner_movement_data[2] + self.inertia_factor), 2)

        if self.inner_movement_data[3] != 0:
            if self.inner_movement_data[3] > 0:
                self.inner_movement_data[3] = round((self.inner_movement_data[3] - self.inertia_factor), 2)
                # self.inner_movement_data[3] += self.gravity_factor
            else:
                self.inner_movement_data[3] = round((self.inner_movement_data[3] + self.inertia_factor + 2), 2)  # +2 - Костыль от костыля от залипания
                # self.inner_movement_data[3] -= self.gravity_factor

        if self.gravity_factor != 0:
            self.inner_movement_data[3] += self.gravity_factor

        if self.shape == 'circle':
            inner_radius = 30
            pg.draw.circle(self.location_screen, self.input_color,
                           (self.inner_movement_data[0], self.inner_movement_data[1]), inner_radius)
            self.borders[0] = self.inner_movement_data[0] - inner_radius
            self.borders[1] = self.inner_movement_data[0] + inner_radius
            self.borders[2] = self.inner_movement_data[1] - inner_radius
            self.borders[3] = self.inner_movement_data[1] + inner_radius

    def controle(self, location_screen=screen,
                 input_coord_x=SCREEN_WIDTH//2, input_coord_y=SCREEN_LENGTH//2):
        """Locate object on screen with linear moving (with static speed)"""
        self.location_screen = location_screen
        self.inner_movement_data[0] = input_coord_x if self.inner_movement_data[0] is None else self.inner_movement_data[0]
        self.inner_movement_data[1] = input_coord_y if self.inner_movement_data[1] is None else self.inner_movement_data[1]

        if self.borders[0] <= 0:
            self.inner_movement_data[2] *= -1  # Speed X
            self.inner_movement_data[0] += 2  # Coord X

        if self.borders[1] >= SCREEN_WIDTH:
            self.inner_movement_data[2] *= -1  # Speed X
            self.inner_movement_data[0] -= 2  # Coord X

        if self.borders[2] <= 0:
            self.inner_movement_data[3] *= -1  # Speed Y
            self.inner_movement_data[1] += 2  # Coord Y

        if self.borders[3] >= SCREEN_LENGTH:
            self.inner_movement_data[3] *= -1  # Speed Y
            self.inner_movement_data[1] -= 2  # Coord Y

        self.inner_movement_data[0] += self.inner_movement_data[2]
        self.inner_movement_data[1] += self.inner_movement_data[3]

        if self.shape == 'circle':
            inner_radius = 10
            pg.draw.circle(self.location_screen, self.input_color,
                           (self.inner_movement_data[0], self.inner_movement_data[1]), inner_radius)
            self.borders[0] = self.inner_movement_data[0] - inner_radius
            self.borders[1] = self.inner_movement_data[0] + inner_radius
            self.borders[2] = self.inner_movement_data[1] - inner_radius
            self.borders[3] = self.inner_movement_data[1] + inner_radius


def main_cycle():
    targets = [Object() for i in range(300)]
    player = Object()

    while not input_keys['quit']:
        clock.tick(FPS)
        screen.fill(BLACK)
        events = pg.event.get()
        processing_keys(events)
        for target in targets:
            # target.linear_move(screen, randint(0, 500), randint(0, 500))
            target.inertional_move(screen, randint(0, 500), randint(0, 500))
            print(f'vy - {target.inner_movement_data[3]}, oy - {target.inner_movement_data[1]}')
        pg.display.update()


if __name__ == '__main__':
    main_cycle()
