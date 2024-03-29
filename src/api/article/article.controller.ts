import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req
} from '@nestjs/common'
import { ArticleService } from './article.service'
import { JwtAuthGuard } from 'src/libs/guard/jwt.guard'
import { ParseIntPipe } from '@nestjs/common'
import { CreateArticleDto } from './dto/create-article.dto'
import { CreateDraftDto } from './dto/create-draft.dto'
import { QueryInfo, UpdateTopOrRec } from 'src/libs/types'
import { UpdateArticleDto } from './dto/update-article.dto'
import { UpdateDraftDto } from './dto/update-draft.dto'
import { Menu } from 'src/libs/decorator/menu/menu.decorator'
import { MenuGuard } from 'src/libs/guard/menu.guard'
import { Request } from 'express'

@Controller('article')
@Menu(6)
@UseGuards(MenuGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  // 新建文章
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() article: CreateArticleDto) {
    return this.articleService.create(article)
  }
  // 获取归档
  @Get('/archives')
  @Menu(0)
  findArchives(@Query() query: QueryInfo) {
    return this.articleService.findArchives(query)
  }
  // 获取置顶文章(默认取访问量最高项)
  @Get('/pinned')
  @Menu(0)
  findPinned() {
    return this.articleService.findPinned()
  }
  // 获取推荐文章(默认只取访问量最高前两项)
  @Get('/featured')
  @Menu(0)
  findFeatured() {
    return this.articleService.findFeatured()
  }
  // 获取文章详情
  @Get('/detail/:id')
  @Menu(0)
  findDetailById(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: Request
  ) {
    return this.articleService.findDetailById(
      id,
      req.clientIp.replace('::ffff:', '')
    )
  }
  // 新建草稿
  @Post('/draft')
  @UseGuards(JwtAuthGuard)
  createDraft(@Body() draft: CreateDraftDto) {
    return this.articleService.create(draft)
  }
  // 根据关键字查询所有文章
  @Get('/search-all')
  @Menu(0)
  searchAll(@Query() query: QueryInfo) {
    return this.articleService.searchAll(query)
  }
  // 根据关键字查询所有已发布文章
  @Get('/search')
  @Menu(0)
  searchAllPublished(@Query('keyword') keyword: string) {
    return this.articleService.searchAllPublished(keyword)
  }
  // 查询访问量前五的文章
  @Get('/top5')
  @Menu(0)
  findTopFive() {
    return this.articleService.findTopFive()
  }
  // 查询已发布的文章
  @Get('/published')
  @Menu(0)
  findAllPublished(@Query() query: QueryInfo) {
    return this.articleService.findAllPublished(query)
  }
  // 查询草稿
  @Get('/draft')
  @Menu(0)
  findAllDraft(@Query() query: QueryInfo) {
    return this.articleService.findAllDraft(query)
  }
  // 获取某一篇文章
  @Get(':id')
  @Menu(0)
  findById(@Param('id', new ParseIntPipe()) id: number) {
    return this.articleService.findById(id)
  }
  // 更新文章
  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Body() article: UpdateArticleDto) {
    return this.articleService.update(article.id, article)
  }
  // 更新草稿
  @Patch('/draft')
  @UseGuards(JwtAuthGuard)
  updateDraft(@Body() article: UpdateDraftDto) {
    return this.articleService.update(article.id, article)
  }
  // 更新置顶状态
  @Patch('/top')
  @UseGuards(JwtAuthGuard)
  updateTop(@Body() status: UpdateTopOrRec) {
    return this.articleService.updateTop(status)
  }
  // 更新推荐状态
  @Patch('/recommend')
  @UseGuards(JwtAuthGuard)
  updateRecommend(@Body() status: UpdateTopOrRec) {
    return this.articleService.updateRecommend(status)
  }
  // 删除某一篇文章
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.articleService.remove(id)
  }
}
