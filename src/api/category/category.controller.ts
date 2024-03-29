import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common'
import { Menu } from 'src/libs/decorator/menu/menu.decorator'
import { JwtAuthGuard } from 'src/libs/guard/jwt.guard'
import { MenuGuard } from 'src/libs/guard/menu.guard'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('category')
@Menu(8)
@UseGuards(MenuGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  // 新建文章分类
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }
  // 获取所有分类
  @Get()
  @Menu(0)
  findAll() {
    return this.categoryService.findAll()
  }
  // 获取所有分类和对应的文章数量
  @Get('/category-count')
  @Menu(0)
  findCategoryAndCount() {
    return this.categoryService.findCategoryAndCount()
  }
  // 获取所有分类和对应的文章数量top10
  @Get('/top10')
  @Menu(0)
  findCategoryTop10() {
    return this.categoryService.findCategoryTop10()
  }
  // 获取某一个分类
  @Get(':id')
  @Menu(0)
  findById(@Param('id', new ParseIntPipe()) id: number) {
    return this.categoryService.findById(id)
  }
  // 更新某一个分类
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto)
  }
  // 删除某一个分类
  @Delete('/remove-one')
  @UseGuards(JwtAuthGuard)
  removeById(@Body('id', new ParseIntPipe()) id: number) {
    return this.categoryService.removeById(id)
  }
  // 批量删除分类
  @Delete('/remove-all')
  @UseGuards(JwtAuthGuard)
  removeByIds(@Body('ids') ids: number[]) {
    return this.categoryService.removeByIds(ids)
  }
}
