import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UpdateArticleDto } from './dto/update-article.dto'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Article } from './entities/article.entity'
import { EntityManager, Repository } from 'typeorm'
import { Tag } from '../tag/entities/tag.entity'
import { Category } from '../category/entities/category.entity'
import { CreateArticleDto } from './dto/create-article.dto'
import { CreateDraftDto } from './dto/create-draft.dto'
import { QueryInfo, UpdateTopOrRec } from 'src/libs/types'
import { throwHttpException } from 'src/libs/utils'
import { UpdateDraftDto } from './dto/update-draft.dto'

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private readonly articleRep: Repository<Article>,
    @InjectEntityManager() private readonly manager: EntityManager
  ) {}

  async create(articleDto: CreateArticleDto | CreateDraftDto) {
    let article = new Article()
    const tags = []
    for (const id of articleDto.tag_ids) {
      const tag = await this.manager.findOneBy(Tag, { id })
      tags.push(tag)
    }
    const category = await this.manager.findOneBy(Category, {
      id: articleDto.category_id
    })
    article = Object.assign(article, articleDto)
    article.tags = tags
    article.category = category
    // 赋值，建立关联
    await this.manager.save(Article, article)
    return article
  }

  async findArchives(query?: QueryInfo) {
    const articles = await this.articleRep.find({
      order: { created_at: 'DESC' },
      skip: parseInt(query.skip),
      take: parseInt(query.limit)
    })
    const cache = {}
    articles.forEach((item) => {
      const timeLine = `${item.created_at.getFullYear()}-${
        item.created_at.getMonth() + 1
      }`
      if (!cache[timeLine]) {
        cache[timeLine] = [item]
      } else {
        cache[timeLine].push(item)
      }
    })
    const res = Object.entries(cache).map((item) => ({
      timeLine: item[0],
      list: item[1]
    }))
    const count = await this.articleRep.count({
      where: { status: true }
    })
    return { res, count }
  }

  async findPinned() {
    const res = (
      await this.articleRep.find({
        relations: ['tags', 'category', 'author'],
        where: { top: true },
        order: { view_times: 'DESC' },
        take: 1
      })
    )[0]
    return res
  }

  async findFeatured() {
    const res = await this.articleRep.find({
      relations: ['tags', 'category', 'author'],
      where: { recommend: true, top: false },
      order: { view_times: 'DESC' },
      take: 2
    })
    return res
  }

  async findDetailById(id: number, ip: string) {
    const res = await Article.getQueryBuilder()
      .where('article.id = :id', { id })
      .getOne()
    const first = await Article.getQueryBuilder()
      .orderBy({ 'article.id': 'ASC' })
      .where('article.status = :status', { status: true })
      .limit(1)
      .getOne()
    const last = await Article.getQueryBuilder()
      .orderBy({ 'article.id': 'DESC' })
      .where('article.status = :status', { status: true })
      .limit(1)
      .getOne()
    const pre = await Article.getQueryBuilder()
      .orderBy({ 'article.id': 'DESC' })
      .where('article.status = :status', { status: true })
      .andWhere('article.id < :id', { id })
      .limit(1)
      .getOne()
    const next = await Article.getQueryBuilder()
      .orderBy({ 'article.id': 'ASC' })
      .where('article.status = :status', { status: true })
      .andWhere('article.id > :id', { id })
      .limit(1)
      .getOne()
    if (ip !== '127.0.0.1') {
      await this.articleRep.update(id, { view_times: res.view_times + 1 })
    }
    return {
      ...res,
      preArticle: pre || last,
      nextArticle: next || first
    }
  }

  async searchAll(query?: QueryInfo) {
    const res = await Article.searchArticle(query)
    const count = await this.articleRep
      .createQueryBuilder()
      .where('article.title like :keyword', {
        keyword: `%${query.keyword || ''}%`
      })
      .orWhere('article.description like :keyword', {
        keyword: `%${query.keyword || ''}%`
      })
      .orWhere('article.content like :keyword', {
        keyword: `%${query.keyword || ''}%`
      })
      .getCount()
    return { res, count }
  }

  async searchAllPublished(keyword?: string) {
    const res = await Article.searchArticle({ keyword }, true)
    return res
  }

  async findTopFive() {
    const res = await this.articleRep.find({
      select: ['id', 'title', 'view_times'],
      where: { status: true },
      order: { view_times: 'DESC' },
      take: 5
    })
    return res
  }

  async findAllPublished(query?: QueryInfo) {
    const [res, count] = await Article.findAll(query, 1)
    return { res, count }
  }

  async findAllDraft(query?: QueryInfo) {
    const [res, count] = await Article.findAll(query, 0)
    return { res, count }
  }

  async findById(id: number) {
    const res = await Article.findById(id)
    return res
  }

  async update(id: number, article: UpdateArticleDto | UpdateDraftDto) {
    const {
      tag_ids,
      category_id,
      tags,
      category,
      created_at,
      updated_at,
      ..._article
    } = article
    const { affected } = await this.articleRep.update(id, _article)
    if (affected > 0) {
      // 更新article 和 tag 的关联
      const article = await this.articleRep.findOneBy({ id })
      if (tag_ids?.length) {
        const tags = []
        for (const id of tag_ids) {
          // 更新 tag
          const tag = await this.manager.findOneBy(Tag, { id })
          tag && tags.push(tag)
        }
        tags.length && (article.tags = tags)
      }
      if (category_id) {
        const category = await this.manager.findOneBy(Category, {
          id: category_id
        })
        category && (article.category = category)
      }
      await this.articleRep.save(article)
      return '更新文章成功！'
    } else {
      throw new HttpException(
        '参数错误，更新文章失败！',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async updateTop(status: UpdateTopOrRec) {
    const { affected } = await this.articleRep
      .createQueryBuilder()
      .update()
      .set({ top: status.top })
      .where('id = :id', { id: status.id })
      .execute()
    if (affected > 0) {
      return '更新文章置顶状态成功！'
    } else {
      throwHttpException(
        '参数错误，更新文章置顶状态失败！',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async updateRecommend(status: UpdateTopOrRec) {
    const { affected } = await this.articleRep
      .createQueryBuilder()
      .update()
      .set({ recommend: status.recommend })
      .where('id = :id', { id: status.id })
      .execute()
    if (affected > 0) {
      return '更新文章推荐状态成功！'
    } else {
      throwHttpException('参数错误，更新文章推荐失败！', HttpStatus.BAD_REQUEST)
    }
  }

  async remove(id: number) {
    const { affected } = await this.articleRep.delete(id)
    if (affected > 0) {
      return '删除文章成功！'
    } else {
      throwHttpException('参数错误，删除文章失败！', HttpStatus.BAD_REQUEST)
    }
  }
}
