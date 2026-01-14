import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Enroll in a course
 */
export const enrollInCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { courseId, affiliateCode } = req.body;
    const userId = req.user.id;

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check affiliate if provided
    let affiliateId = null;
    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { affiliateCode },
        include: { user: true },
      });
      if (affiliate && affiliate.status === 'APPROVED') {
        affiliateId = affiliate.userId;
      }
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: course.isFree ? 'ACTIVE' : 'PENDING',
        affiliateId,
      },
      include: {
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    // Update course enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalEnrollments: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Successfully enrolled in course',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user enrollments
 */
export const getUserEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          course: {
            include: {
              instructor: true,
              category: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollment by ID
 */
export const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            instructor: true,
            lessons: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unenroll from course
 */
export const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    await prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    // Update course enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalEnrollments: {
          decrement: 1,
        },
      },
    });

    res.json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all enrollments (Admin only)
 */
export const getAllEnrollments = async (req, res, next) => {
  try {
    const { status, courseId, userId, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    if (userId) where.userId = userId;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          course: {
            include: {
              instructor: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};


