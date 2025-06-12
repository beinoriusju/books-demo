<?php

namespace App\Repository;

use App\Entity\Book;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Book>
 */
class BookRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Book::class);
    }

    public function searchBooks($filter): array
    {
        $query = $filter['query'] ?? '';
        $page = $filter['page'] ?? 1;
        $limit = $filter['limit'] ?? 10;
        $sort = $filter['sort'] ?? 'title';
        $order = $filter['order'] ?? 'ASC';

        // Calculate offset for pagination
        $offset = ($page - 1) * $limit;

        $qb = $this->createQueryBuilder('b')
            ->where('LOWER(b.title) LIKE :query OR LOWER(b.author) LIKE :query')
            ->setParameter('query', '%' . strtolower($query) . '%')
            ->orderBy('b.' . $sort, $order)
            ->setFirstResult($offset)
            ->setMaxResults($limit);
        $queryBuilder = $qb->getQuery();
        $books = $queryBuilder->getResult();
        $totalBooks = $this->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->where('LOWER(b.title) LIKE :query OR LOWER(b.author) LIKE :query')
            ->setParameter('query', '%' . strtolower($query) . '%')
            ->getQuery()
            ->getSingleScalarResult();
        $totalPages = ceil($totalBooks / $limit);
        if ($totalPages < 1) {
            $totalPages = 1; // Ensure at least one page is returned
        }
        if ($page < 1) {
            $page = 1; // Ensure page is at least 1
        } elseif ($page > $totalPages) {
            $page = $totalPages; // Ensure page does not exceed total pages
        }

        return [
            'books' => $books,
            'totalPages' => $totalPages,
        ];
    }
}
