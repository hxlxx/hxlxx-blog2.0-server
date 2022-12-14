import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { throwHttpException } from 'src/libs/utils'
import { Repository } from 'typeorm'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from './entities/category.entity'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRep: Repository<Category>
  ) {}

  async create({ category_name }: CreateCategoryDto) {
    const isExist = await this.categoryRep.findOneBy({ category_name })
    if (isExist) {
      throwHttpException(
        'The category is already exist',
        HttpStatus.BAD_REQUEST
      )
    }
    const category = new Category()
    category.category_name = category_name
    const res = await this.categoryRep.save(category)
    return res
  }

  async findAll() {
    const [res, count] = await this.categoryRep.findAndCount()
    return { res, count }
  }

  async findById(id: number) {
    const res = await this.categoryRep.findOneBy({ id })
    return res
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { affected } = await this.categoryRep.update(id, updateCategoryDto)
    if (affected > 0) {
      return 'update category successfully'
    } else {
      throwHttpException(
        'Update failed, please check the parameter',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async remove(id: number) {
    await this.categoryRep.delete(id)
    return 'delete category successfully'
  }
}
