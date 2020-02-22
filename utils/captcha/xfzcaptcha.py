import random
import time
import os
import string
# Image:是一个画板(context),ImageDraw:是一个画笔, ImageFont:画笔的字体
from PIL import Image, ImageDraw, ImageFont


# Captcha验证码
class Captcha:
    # 字体的位置
    font_path = os.path.join(os.path.dirname(__file__), 'verdana.ttf')
    # 生成几位数的验证码
    number = 4
    # 生成验证码图片的宽度和高度
    size = (100, 40)
    # 背景颜色
    bgcolor = (0, 0, 0)
    # 随机字体颜色
    random.seed(int(time.time()))
    fontcolor = (random.randint(200, 255), random.randint(100, 255), random.randint(100, 255))
    # 验证码字体大小
    fontsize = 20
    # 随机干扰线的颜色
    linecolor = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    # 是否要加入干扰线
    drawline = True
    # 是否绘制干扰点
    drawpoint = True
    # 加入干扰线的条数
    linenumber = 3
    # 字符库
    SOURCE = list(string.ascii_letters) + [str(i) for i in range(10)]

    # 用来随机生成一个字符串(包括英文和数字)
    @classmethod
    def gene_text(cls):
        return ''.join(random.sample(cls.SOURCE, cls.number))

    # 用来绘制干扰线
    @classmethod
    def __gene_line(cls, draw, width, height):
        begin = (random.randint(0,width), random.randint(0,height))
        end = (random.randint(0, width), random.randint(0, height))
        draw.line([begin, end], fill=cls.linecolor)

    # 用来绘制干扰点
    @classmethod
    def __gene_point(cls, draw, point_chance, width, height):
        chance = min(100, max(0, int(point_chance)))
        for w in range(width):
            for h in range(height):
                tmp = random.randint(0, 100)
                if tmp > 100 - chance:
                    draw.point((w, h), fill=(0, 0, 0))

    # 生成验证码
    @classmethod
    def gene_code(cls):
        width, height = cls.size
        image = Image.new('RGBA', (width, height), cls.bgcolor) # 创建画板
        font = ImageFont.truetype(cls.font_path, cls.fontsize)
        draw = ImageDraw.Draw(image)
        text = cls.gene_text()
        font_width, font_height = font.getsize(text)
        draw.text(((width - font_width) / 2, (height - font_height) / 2),text,font= font,fill=cls.fontcolor) #填充字符串

        if cls.drawline:
            for x in range(0, cls.linenumber):
                cls.__gene_line(draw, width, height)
        
        if cls.drawpoint:
            cls.__gene_point(draw, 10, width, height)

        return (text, image)