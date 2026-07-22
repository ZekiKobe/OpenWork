import { Op } from 'sequelize';
import Review, { ReviewType } from '../models/Review';
import Contract, { ContractStatus } from '../models/Contract';
import Job from '../models/Job';
import Gig from '../models/Gig';
import User from '../models/User';

export class ReviewService {
  /**
   * Create review for contract
   */
  static async createContractReview(
    reviewerId: number,
    contractId: number,
    rating: number,
    comment: string
  ): Promise<Review> {
    const contract = await Contract.findByPk(contractId);

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Check if contract is completed
    if (![ContractStatus.COMPLETED, ContractStatus.APPROVED].includes(contract.contract_status)) {
      throw new Error('Can only review completed contracts');
    }

    // Determine reviewee (if reviewer is client, reviewee is freelancer, and vice versa)
    const revieweeId = contract.client_id === reviewerId 
      ? contract.freelancer_id 
      : contract.client_id;

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        contract_id: contractId,
        reviewer_id: reviewerId,
        review_type: ReviewType.CONTRACT
      }
    });

    if (existingReview) {
      throw new Error('Review already submitted for this contract');
    }

    // Create review
    const review = await Review.create({
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      contract_id: contractId,
      review_type: ReviewType.CONTRACT,
      rating,
      comment,
      is_public: true
    });

    // Update contract review fields (for backward compatibility)
    if (contract.client_id === reviewerId) {
      await contract.update({
        client_rating: rating,
        client_review: comment
      });
    } else {
      await contract.update({
        freelancer_rating: rating,
        freelancer_review: comment
      });
    }

    // Update user rating
    await this.updateUserRating(revieweeId);

    return review;
  }

  /**
   * Create review for job
   */
  static async createJobReview(
    reviewerId: number,
    jobId: number,
    revieweeId: number,
    rating: number,
    comment: string
  ): Promise<Review> {
    const job = await Job.findByPk(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      throw new Error('Can only review completed jobs');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        job_id: jobId,
        reviewer_id: reviewerId,
        review_type: ReviewType.JOB
      }
    });

    if (existingReview) {
      throw new Error('Review already submitted for this job');
    }

    // Create review
    const review = await Review.create({
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      job_id: jobId,
      review_type: ReviewType.JOB,
      rating,
      comment,
      is_public: true
    });

    // Update user rating
    await this.updateUserRating(revieweeId);

    return review;
  }

  /**
   * Create review for gig
   */
  static async createGigReview(
    reviewerId: number,
    gigId: number,
    revieweeId: number,
    rating: number,
    comment: string
  ): Promise<Review> {
    const gig = await Gig.findByPk(gigId);

    if (!gig) {
      throw new Error('Gig not found');
    }

    // Check if review already exists for this gig by this reviewer
    const existingReview = await Review.findOne({
      where: {
        gig_id: gigId,
        reviewer_id: reviewerId,
        review_type: ReviewType.GIG
      }
    });

    if (existingReview) {
      throw new Error('Review already submitted for this gig');
    }

    // Create review
    const review = await Review.create({
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      gig_id: gigId,
      review_type: ReviewType.GIG,
      rating,
      comment,
      is_public: true
    });

    // Update gig rating
    await this.updateGigRating(gigId);

    // Update user rating
    await this.updateUserRating(revieweeId);

    return review;
  }

  /**
   * Get reviews for a user
   */
  static async getUserReviews(
    userId: number,
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } = await Review.findAndCountAll({
      where: {
        reviewee_id: userId,
        is_public: true
      },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'avatar_url'] },
        { model: Contract, as: 'contract', attributes: ['id', 'title'] },
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: Gig, as: 'gig', attributes: ['id', 'title'] }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const allReviews = await Review.findAll({
      where: { reviewee_id: userId, is_public: true },
      attributes: ['rating']
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + parseFloat(r.rating.toString()), 0) / allReviews.length
      : 0;

    return {
      reviews: rows,
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: count,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get reviews for a contract
   */
  static async getContractReviews(contractId: number) {
    const reviews = await Review.findAll({
      where: {
        contract_id: contractId,
        review_type: ReviewType.CONTRACT
      },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'avatar_url'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return reviews;
  }

  /**
   * Update user rating based on all reviews
   */
  static async updateUserRating(userId: number): Promise<void> {
    const reviews = await Review.findAll({
      where: { reviewee_id: userId, is_public: true },
      attributes: ['rating']
    });

    if (reviews.length === 0) {
      return;
    }

    const avgRating = reviews.reduce(
      (sum, r) => sum + parseFloat(r.rating.toString()),
      0
    ) / reviews.length;

    await User.update(
      { rating: parseFloat(avgRating.toFixed(2)) },
      { where: { id: userId } }
    );
  }

  /**
   * Update gig rating based on all reviews
   */
  static async updateGigRating(gigId: number): Promise<void> {
    const reviews = await Review.findAll({
      where: { gig_id: gigId, is_public: true },
      attributes: ['rating']
    });

    if (reviews.length === 0) {
      return;
    }

    const avgRating = reviews.reduce(
      (sum, r) => sum + parseFloat(r.rating.toString()),
      0
    ) / reviews.length;

    const totalReviews = reviews.length;

    await Gig.update(
      {
        rating: parseFloat(avgRating.toFixed(2)),
        total_reviews: totalReviews
      },
      { where: { id: gigId } }
    );
  }
}
